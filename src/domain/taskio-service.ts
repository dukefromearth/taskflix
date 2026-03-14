import { ulid } from 'ulid';
import type { Kysely } from 'kysely';
import { assert, DomainError } from './errors';
import { canTransitionStatus, isTerminalStatus } from './status';
import { normalizeTagName, toTagDisplayName } from './tag';
import { daysFromNowLocal, isSameLocalDay } from './time';
import { TimelineReadModel, type TimelineStructureInput, type TimelineSummaryInput } from './timeline-read-model';
import type {
  Attachment,
  AttachmentContent,
  HistoryViewDto,
  InboxViewDto,
  Item,
  ItemDetailDto,
  ItemKind,
  ItemRowDto,
  ItemStatus,
  Link,
  LinkKind,
  PreviewStatus,
  Project,
  ProjectStatus,
  ProjectViewDto,
  QueryFilter,
  SavedView,
  SearchResultDto,
  SourceKind,
  Tag,
  TextExtractionStatus,
  TimelineStructureDto,
  TimelineSummaryDto,
  TodayViewDto,
  UpcomingViewDto,
  UserPreference
} from './types';
import type { DatabaseSchema } from '../db/schema';
import { getDatabaseRuntime } from '../db/client';
import { ProjectRepository } from '../repositories/project-repository';
import { ItemRepository } from '../repositories/item-repository';
import { TagRepository } from '../repositories/tag-repository';
import { LinkRepository } from '../repositories/link-repository';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { EventRepository } from '../repositories/event-repository';
import { SavedViewRepository } from '../repositories/saved-view-repository';
import { SearchRepository } from '../repositories/search-repository';
import { PreferenceRepository } from '../repositories/preference-repository';
import type { DbExecutor } from '../repositories/repository-types';

type CreateProjectInput = {
  title: string;
  slug: string;
  descriptionMd?: string;
  status?: ProjectStatus;
  colorToken?: string;
  icon?: string;
};

type CreateItemInput = {
  title: string;
  projectId?: string;
  parentItemId?: string;
  kind?: ItemKind;
  descriptionMd?: string;
  status?: ItemStatus;
  priority?: 0 | 1 | 2 | 3 | 4;
  scheduledAt?: number;
  dueAt?: number;
  snoozedUntil?: number;
  requestedBy?: string;
  isInterruption?: boolean;
  sourceKind?: SourceKind;
  sourceRef?: string;
  tags?: string[];
};

type UpdateItemInput = Partial<Omit<CreateItemInput, 'tags'>> & { title?: string; descriptionMd?: string };

type AddAttachmentInput = {
  itemId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  previewStatus?: PreviewStatus;
  textExtractionStatus?: TextExtractionStatus;
};

type TaskioServiceOptions = {
  db?: Kysely<DatabaseSchema>;
  timezone?: string;
};

const ALLOWED_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

const createRepositories = (db: DbExecutor) => ({
  projects: new ProjectRepository(db),
  items: new ItemRepository(db),
  tags: new TagRepository(db),
  links: new LinkRepository(db),
  attachments: new AttachmentRepository(db),
  events: new EventRepository(db),
  savedViews: new SavedViewRepository(db),
  search: new SearchRepository(db),
  preferences: new PreferenceRepository(db)
});

export class TaskioService {
  private readonly db: Kysely<DatabaseSchema>;
  private readonly timezone: string;
  private readonly timelineReadModel: TimelineReadModel;

  constructor(options?: TaskioServiceOptions) {
    this.db = options?.db ?? getDatabaseRuntime().db;
    this.timezone = options?.timezone ?? process.env.TASKIO_TIMEZONE ?? 'America/New_York';
    this.timelineReadModel = new TimelineReadModel({
      db: this.db,
      timezone: this.timezone,
      getUserPreference: () => this.getUserPreference(),
      rowsForItemIds: (itemIds, now) => this.rowsForItemIds(itemIds, now),
      logTiming: (operation, startedAt, extra) => this.logTimelineTiming(operation, startedAt, extra)
    });
  }

  async getUserPreference(): Promise<UserPreference> {
    return createRepositories(this.db).preferences.getOrCreateDefault(this.timezone);
  }

  async listProjects(input?: { includeArchived?: boolean }): Promise<Project[]> {
    return createRepositories(this.db).projects.list(input);
  }

  async getProject(projectId: string): Promise<Project> {
    const project = await createRepositories(this.db).projects.get(projectId);
    if (!project) {
      throw new DomainError('not_found', 'Project not found');
    }
    return project;
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    assert(input.title.trim().length > 0, 'Project title is required');
    assert(input.slug.trim().length > 0, 'Project slug is required');

    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const slug = input.slug.trim().toLowerCase();
      const slugConflict = await repos.projects.getBySlug(slug);
      if (slugConflict) {
        throw new DomainError('conflict', `Project slug already exists: ${slug}`);
      }

      const now = Date.now();
      const project: Project = {
        id: ulid(),
        slug,
        title: input.title.trim(),
        descriptionMd: input.descriptionMd?.trim() ?? '',
        status: input.status ?? 'active',
        colorToken: input.colorToken,
        icon: input.icon,
        orderKey: await repos.projects.nextOrderKey(),
        createdAt: now,
        updatedAt: now
      };

      await repos.projects.insert(project);
      return project;
    });
  }

  async updateProject(projectId: string, patch: Partial<CreateProjectInput>): Promise<Project> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.projects.get(projectId);
      if (!existing) {
        throw new DomainError('not_found', 'Project not found');
      }

      const nextSlug = patch.slug?.trim().toLowerCase() ?? existing.slug;
      if (nextSlug !== existing.slug) {
        const conflict = await repos.projects.getBySlug(nextSlug);
        if (conflict && conflict.id !== projectId) {
          throw new DomainError('conflict', `Project slug already exists: ${nextSlug}`);
        }
      }

      const now = Date.now();
      const updated: Project = {
        ...existing,
        title: patch.title?.trim() ?? existing.title,
        slug: nextSlug,
        descriptionMd: patch.descriptionMd?.trim() ?? existing.descriptionMd,
        status: patch.status ?? existing.status,
        colorToken: patch.colorToken ?? existing.colorToken,
        icon: patch.icon ?? existing.icon,
        updatedAt: now,
        archivedAt: patch.status === 'archived' ? now : existing.archivedAt
      };

      await repos.projects.update(updated);

      const itemRows = await repos.items.listByProject(projectId);
      for (const item of itemRows) {
        await repos.search.upsertItemDocument(item.id);
      }

      return updated;
    });
  }

  async deleteProject(projectId: string): Promise<Project> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.projects.get(projectId);
      if (!existing) {
        throw new DomainError('not_found', 'Project not found');
      }

      const now = Date.now();
      const archived: Project = {
        ...existing,
        status: 'archived',
        archivedAt: now,
        updatedAt: now
      };

      await repos.projects.update(archived);
      return archived;
    });
  }

  async reorderProjects(input: { projectId: string; leftProjectId?: string; rightProjectId?: string }): Promise<Project> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const target = await repos.projects.get(input.projectId);
      if (!target) {
        throw new DomainError('not_found', 'Project not found');
      }

      const left = input.leftProjectId ? await repos.projects.get(input.leftProjectId) : undefined;
      const right = input.rightProjectId ? await repos.projects.get(input.rightProjectId) : undefined;
      const nextOrderKey = await this.generateOrderKeyBetweenProjects(repos, left?.id, right?.id);

      const updated: Project = {
        ...target,
        orderKey: nextOrderKey,
        updatedAt: Date.now()
      };
      await repos.projects.update(updated);
      return updated;
    });
  }

  async createItem(input: CreateItemInput, commandId = ulid()): Promise<Item> {
    assert(input.title.trim().length > 0, 'Item title is required');

    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);

      if (input.projectId) {
        const project = await repos.projects.get(input.projectId);
        if (!project) throw new DomainError('not_found', 'Project not found');
      }

      if (input.parentItemId) {
        const parent = await repos.items.get(input.parentItemId);
        if (!parent) throw new DomainError('not_found', 'Parent item not found');
        assert(parent.projectId === input.projectId, 'Parent and child must stay in same project scope');
      }

      const now = Date.now();
      const item: Item = {
        id: ulid(),
        projectId: input.projectId,
        parentItemId: input.parentItemId,
        kind: input.kind ?? 'task',
        title: input.title.trim(),
        descriptionMd: input.descriptionMd?.trim() ?? '',
        status: input.status ?? 'inbox',
        priority: input.priority ?? 2,
        orderKey: await repos.items.nextOrderKey(input.projectId, input.parentItemId),
        scheduledAt: input.scheduledAt,
        dueAt: input.dueAt,
        completedAt: input.status === 'done' ? now : undefined,
        snoozedUntil: input.snoozedUntil,
        requestedBy: input.requestedBy,
        isInterruption: input.isInterruption ?? false,
        sourceKind: input.sourceKind ?? 'manual',
        sourceRef: input.sourceRef,
        createdAt: now,
        updatedAt: now
      };

      await repos.items.insert(item);

      for (const rawTag of input.tags ?? []) {
        const tag = await this.addTagToItemInternal(repos, item.id, rawTag, commandId);
        if (tag) {
          // no-op
        }
      }

      await repos.events.insert({
        id: ulid(),
        itemId: item.id,
        commandId,
        eventType: 'item.created',
        payloadJson: { status: item.status },
        occurredAt: now
      });

      await repos.search.upsertItemDocument(item.id);
      return item;
    });
  }

  async updateItem(itemId: string, patch: UpdateItemInput, commandId = ulid()): Promise<Item> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.items.get(itemId);
      if (!existing) {
        throw new DomainError('not_found', 'Item not found');
      }

      if (patch.projectId) {
        const project = await repos.projects.get(patch.projectId);
        if (!project) throw new DomainError('not_found', 'Project not found');
      }

      // TODO(GOTCHA): Parent reassignment currently blocks simple cycles only; deep cyclic checks should be expanded if nested moves become common.
      if (patch.parentItemId) {
        assert(patch.parentItemId !== itemId, 'Item cannot be its own parent');
        const parent = await repos.items.get(patch.parentItemId);
        if (!parent) throw new DomainError('not_found', 'Parent item not found');
        const projectId = patch.projectId ?? existing.projectId;
        assert(parent.projectId === projectId, 'Parent and child must stay in same project scope');
      }

      const now = Date.now();
      const updated: Item = {
        ...existing,
        ...patch,
        title: patch.title?.trim() ?? existing.title,
        descriptionMd: patch.descriptionMd?.trim() ?? existing.descriptionMd,
        updatedAt: now
      };

      if (patch.status !== undefined) {
        this.assertTransition(existing.status, patch.status);
        if (patch.status === 'done') {
          updated.completedAt = now;
        }
        if (existing.status === 'done' && patch.status !== 'done') {
          updated.completedAt = undefined;
        }
      }

      await repos.items.update(updated);
      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: 'item.updated',
        payloadJson: { patch },
        occurredAt: now
      });
      await repos.search.upsertItemDocument(itemId);
      return updated;
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.items.get(itemId);
      if (!existing) {
        throw new DomainError('not_found', 'Item not found');
      }

      await repos.items.update({ ...existing, deletedAt: Date.now(), updatedAt: Date.now() });
      await repos.search.removeItemDocument(itemId);
    });
  }

  async changeItemStatus(itemId: string, to: ItemStatus, commandId = ulid(), reason?: string): Promise<Item> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) {
        throw new DomainError('not_found', 'Item not found');
      }

      this.assertTransition(item.status, to);

      const now = Date.now();
      const updated: Item = {
        ...item,
        status: to,
        updatedAt: now,
        completedAt: to === 'done' ? now : item.status === 'done' ? undefined : item.completedAt
      };

      await repos.items.update(updated);
      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: to === 'done' ? 'item.completed' : item.status === 'done' ? 'item.reopened' : 'item.statusChanged',
        payloadJson: { from: item.status, to, reason },
        occurredAt: now
      });

      await repos.search.upsertItemDocument(itemId);
      return updated;
    });
  }

  async scheduleItem(itemId: string, scheduledAt?: number, dueAt?: number, commandId = ulid()): Promise<Item> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      const updated: Item = {
        ...item,
        scheduledAt,
        dueAt,
        updatedAt: Date.now()
      };

      await repos.items.update(updated);
      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: 'item.scheduled',
        payloadJson: { scheduledAt, dueAt },
        occurredAt: Date.now()
      });
      await repos.search.upsertItemDocument(itemId);
      return updated;
    });
  }

  async deferItem(itemId: string, snoozedUntil: number, commandId = ulid()): Promise<Item> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      const updated: Item = {
        ...item,
        snoozedUntil,
        updatedAt: Date.now()
      };

      await repos.items.update(updated);
      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: 'item.updated',
        payloadJson: { snoozedUntil },
        occurredAt: Date.now()
      });
      await repos.search.upsertItemDocument(itemId);

      return updated;
    });
  }

  async addTagToItem(itemId: string, rawTagName: string, commandId = ulid()): Promise<Tag> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      const tag = await this.addTagToItemInternal(repos, itemId, rawTagName, commandId);
      if (!tag) {
        const existing = await repos.tags.getByName(normalizeTagName(rawTagName));
        if (!existing) throw new DomainError('not_found', 'Tag not found');
        return existing;
      }

      await repos.search.upsertItemDocument(itemId);
      return tag;
    });
  }

  async removeTagFromItem(itemId: string, rawTagName: string, commandId = ulid()): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      const normalized = normalizeTagName(rawTagName);
      const tag = await repos.tags.getByName(normalized);
      if (!tag) return;

      const removed = await repos.tags.detach(itemId, tag.id);
      if (!removed) return;

      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: 'item.tagRemoved',
        payloadJson: { tag: normalized },
        occurredAt: Date.now()
      });
      await repos.search.upsertItemDocument(itemId);
    });
  }

  async addLink(itemId: string, input: { url: string; label?: string; kind?: LinkKind }, commandId = ulid()): Promise<Link> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      this.assertSafeUrl(input.url);
      const link: Link = {
        id: ulid(),
        itemId,
        url: input.url,
        label: input.label,
        kind: input.kind ?? 'generic',
        createdAt: Date.now()
      };

      await repos.links.insert(link);
      await repos.events.insert({
        id: ulid(),
        itemId,
        commandId,
        eventType: 'item.linkAdded',
        payloadJson: { url: input.url, kind: link.kind },
        occurredAt: Date.now()
      });

      return link;
    });
  }

  async addAttachment(input: AddAttachmentInput, commandId = ulid()): Promise<Attachment> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const item = await repos.items.get(input.itemId);
      if (!item) throw new DomainError('not_found', 'Item not found');

      const attachment: Attachment = {
        id: ulid(),
        itemId: input.itemId,
        storageKey: input.storageKey,
        originalName: input.originalName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        sha256: input.sha256,
        previewStatus: input.previewStatus ?? 'none',
        textExtractionStatus: input.textExtractionStatus ?? 'none',
        createdAt: Date.now()
      };

      await repos.attachments.insert(attachment);
      await repos.events.insert({
        id: ulid(),
        itemId: input.itemId,
        commandId,
        eventType: 'item.attachmentAdded',
        payloadJson: { attachmentId: attachment.id, mimeType: attachment.mimeType },
        occurredAt: Date.now()
      });

      await repos.search.upsertItemDocument(input.itemId);
      return attachment;
    });
  }

  async setAttachmentContent(attachmentId: string, textContent: string): Promise<AttachmentContent> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const attachment = await repos.attachments.get(attachmentId);
      if (!attachment) throw new DomainError('not_found', 'Attachment not found');

      const content: AttachmentContent = {
        attachmentId,
        textContent,
        contentHash: `h-${textContent.length}`,
        extractedAt: Date.now()
      };

      await repos.attachments.upsertContent(content);
      await repos.attachments.update({
        ...attachment,
        textExtractionStatus: 'ready'
      });
      await repos.search.upsertItemDocument(attachment.itemId);
      return content;
    });
  }

  async reorderItems(input: { itemId: string; leftItemId?: string; rightItemId?: string }, commandId = ulid()): Promise<Item> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const target = await repos.items.get(input.itemId);
      if (!target) throw new DomainError('not_found', 'Item not found');

      const left = input.leftItemId ? await repos.items.get(input.leftItemId) : undefined;
      const right = input.rightItemId ? await repos.items.get(input.rightItemId) : undefined;
      const nextKey = await this.generateOrderKeyBetweenItems(repos, left?.id, right?.id);

      const updated: Item = {
        ...target,
        orderKey: nextKey,
        updatedAt: Date.now()
      };

      await repos.items.update(updated);
      await repos.events.insert({
        id: ulid(),
        itemId: target.id,
        commandId,
        eventType: 'item.reordered',
        payloadJson: { leftItemId: input.leftItemId, rightItemId: input.rightItemId, orderKey: nextKey },
        occurredAt: Date.now()
      });

      return updated;
    });
  }

  async createSavedView(input: { name: string; icon?: string; queryJson: QueryFilter }): Promise<SavedView> {
    assert(input.name.trim().length > 0, 'Saved view name is required');

    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const now = Date.now();
      const view: SavedView = {
        id: ulid(),
        name: input.name.trim(),
        icon: input.icon,
        queryJson: input.queryJson,
        orderKey: await repos.savedViews.nextOrderKey(),
        createdAt: now,
        updatedAt: now
      };

      await repos.savedViews.insert(view);
      return view;
    });
  }

  async listSavedViews(): Promise<SavedView[]> {
    return createRepositories(this.db).savedViews.list();
  }

  async updateSavedView(savedViewId: string, patch: Partial<Pick<SavedView, 'name' | 'icon' | 'queryJson'>>): Promise<SavedView> {
    return this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.savedViews.get(savedViewId);
      if (!existing) throw new DomainError('not_found', 'Saved view not found');

      const updated: SavedView = {
        ...existing,
        name: patch.name?.trim() ? patch.name.trim() : existing.name,
        icon: patch.icon ?? existing.icon,
        queryJson: patch.queryJson ?? existing.queryJson,
        updatedAt: Date.now()
      };

      await repos.savedViews.update(updated);
      return updated;
    });
  }

  async deleteSavedView(savedViewId: string): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const existing = await repos.savedViews.get(savedViewId);
      if (!existing) throw new DomainError('not_found', 'Saved view not found');

      await repos.savedViews.update({
        ...existing,
        deletedAt: Date.now(),
        updatedAt: Date.now()
      });
    });
  }

  async getTodayView(now = Date.now()): Promise<TodayViewDto> {
    const preference = await this.getUserPreference();
    const rows = (await this.activeRows(now, preference.todayShowsDone)).filter((row) => {
      return !row._meta.snoozedUntil || row._meta.snoozedUntil <= now || row.isOverdue;
    });

    const triage = rows.filter((row) => row.status === 'inbox');
    const overdue = rows.filter((row) => row.isOverdue && !isTerminalStatus(row.status));
    const today = rows.filter((row) => {
      if (overdue.some((o) => o.id === row.id)) return false;
      if (isTerminalStatus(row.status)) return false;
      return (
        (row.dueAt !== undefined && isSameLocalDay(row.dueAt, now, preference.timezone)) ||
        (row.scheduledAt !== undefined && isSameLocalDay(row.scheduledAt, now, preference.timezone))
      );
    });
    const inProgress = rows.filter((row) => {
      if (row.status !== 'active') return false;
      if (today.some((t) => t.id === row.id)) return false;
      if (overdue.some((o) => o.id === row.id)) return false;
      return true;
    });

    return {
      now,
      timezone: preference.timezone,
      sections: [
        { key: 'triage', label: 'Needs Triage', count: triage.length, items: this.sortTodayRows(this.stripMeta(triage)) },
        { key: 'overdue', label: 'Overdue', count: overdue.length, items: this.sortTodayRows(this.stripMeta(overdue)) },
        { key: 'today', label: 'Today', count: today.length, items: this.sortTodayRows(this.stripMeta(today)) },
        { key: 'inProgress', label: 'In Progress', count: inProgress.length, items: this.sortTodayRows(this.stripMeta(inProgress)) }
      ]
    };
  }

  async getUpcomingView(now = Date.now()): Promise<UpcomingViewDto> {
    const preference = await this.getUserPreference();
    const rows = this.stripMeta((await this.activeRows(now, preference.todayShowsDone)).filter((row) => !isTerminalStatus(row.status)));

    const tomorrow: ItemRowDto[] = [];
    const thisWeek: ItemRowDto[] = [];
    const nextWeek: ItemRowDto[] = [];
    const later: ItemRowDto[] = [];

    for (const row of rows) {
      const ts = row.scheduledAt ?? row.dueAt;
      if (ts === undefined) continue;
      const days = daysFromNowLocal(ts, now, preference.timezone);
      if (days === 1) tomorrow.push(row);
      else if (days >= 2 && days <= 7) thisWeek.push(row);
      else if (days >= 8 && days <= 14) nextWeek.push(row);
      else if (days > 14) later.push(row);
    }

    const sort = (list: ItemRowDto[]) =>
      list.sort((a, b) => {
        const aTs = a.scheduledAt ?? a.dueAt ?? Number.MAX_SAFE_INTEGER;
        const bTs = b.scheduledAt ?? b.dueAt ?? Number.MAX_SAFE_INTEGER;
        if (aTs !== bTs) return aTs - bTs;
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.id.localeCompare(b.id);
      });

    return {
      now,
      timezone: preference.timezone,
      buckets: [
        { key: 'tomorrow', label: 'Tomorrow', items: sort(tomorrow) },
        { key: 'thisWeek', label: 'This Week', items: sort(thisWeek) },
        { key: 'nextWeek', label: 'Next Week', items: sort(nextWeek) },
        { key: 'later', label: 'Later', items: sort(later) }
      ]
    };
  }

  async getInboxView(now = Date.now()): Promise<InboxViewDto> {
    const preference = await this.getUserPreference();
    const rows = (await this.rowsForItems(await this.filterItems({ statuses: ['inbox'], includeDone: true }), now)).sort((a, b) =>
      b.id.localeCompare(a.id)
    );

    return {
      now,
      timezone: preference.timezone,
      items: rows
    };
  }

  async getProjectView(projectId: string, now = Date.now()): Promise<ProjectViewDto> {
    const preference = await this.getUserPreference();
    const repos = createRepositories(this.db);
    const project = await repos.projects.get(projectId);
    if (!project) {
      throw new DomainError('not_found', 'Project not found');
    }

    const items = await this.rowsForItems(await repos.items.listByProject(projectId), now);
    const history = await repos.events.listByProject(projectId, 100);

    return {
      now,
      timezone: preference.timezone,
      project,
      items,
      history
    };
  }

  async getHistoryView(now = Date.now()): Promise<HistoryViewDto> {
    const preference = await this.getUserPreference();
    const events = await createRepositories(this.db).events.listAll();
    return {
      now,
      timezone: preference.timezone,
      events
    };
  }

  async getTimelineStructure(input: TimelineStructureInput = {}): Promise<TimelineStructureDto> {
    return this.timelineReadModel.getStructure(input);
  }

  async getTimelineSummary(input: TimelineSummaryInput = {}): Promise<TimelineSummaryDto> {
    return this.timelineReadModel.getSummary(input);
  }

  private async rowsForItemIds(itemIds: string[], now = Date.now()): Promise<ItemRowDto[]> {
    const uniqueIds = [...new Set(itemIds)];
    const items = await createRepositories(this.db).items.listByIds(uniqueIds);
    return this.rowsForItems(items, now);
  }

  private logTimelineTiming(operation: string, startedAt: number, extra?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'test') return;
    const elapsedMs = Date.now() - startedAt;
    console.info(
      JSON.stringify({
        operation,
        elapsedMs,
        ...extra
      })
    );
  }

  async search(query: string, filter?: QueryFilter): Promise<SearchResultDto[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      const items = await this.filterItems(filter);
      const rows = await this.rowsForItems(items, Date.now());
      return rows.map((item) => ({ item, score: 0 }));
    }

    const repos = createRepositories(this.db);
    const hits = await repos.search.search(trimmed);
    const hitMap = new Map(hits.map((hit) => [hit.itemId, hit.rank]));
    const candidateIds = hits.map((hit) => hit.itemId);

    if (candidateIds.length === 0) {
      return [];
    }

    const allFilteredItems = await this.filterItems({ ...filter, includeDone: filter?.includeDone ?? true });
    const selectedItems = allFilteredItems.filter((item) => hitMap.has(item.id));
    const rows = await this.rowsForItems(selectedItems, Date.now());

    const results = rows.map((row) => {
      const rank = hitMap.get(row.id) ?? 9999;
      const score = 1 / (1 + Math.max(rank, 0));
      return {
        item: row,
        score,
        snippet: row.title
      };
    });

    return results.sort((a, b) => b.score - a.score || b.item.id.localeCompare(a.item.id));
  }

  async getAttachment(attachmentId: string): Promise<Attachment> {
    const attachment = await createRepositories(this.db).attachments.get(attachmentId);
    if (!attachment) {
      throw new DomainError('not_found', 'Attachment not found');
    }

    return attachment;
  }

  async getItemDetail(itemId: string): Promise<ItemDetailDto> {
    const repos = createRepositories(this.db);
    const item = await repos.items.get(itemId);
    if (!item) throw new DomainError('not_found', 'Item not found');

    const [project, tags, links, attachments, events] = await Promise.all([
      item.projectId ? repos.projects.get(item.projectId) : Promise.resolve(undefined),
      repos.tags.listByItemId(itemId),
      repos.links.listByItemId(itemId),
      repos.attachments.listByItemId(itemId),
      repos.events.listByItemId(itemId, 200)
    ]);

    return {
      item,
      project: project ?? undefined,
      tags,
      links,
      attachments,
      events
    };
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      const repos = createRepositories(trx);
      const attachment = await repos.attachments.get(attachmentId);
      if (!attachment) throw new DomainError('not_found', 'Attachment not found');

      await repos.attachments.update({
        ...attachment,
        deletedAt: Date.now()
      });
      await repos.search.upsertItemDocument(attachment.itemId);
    });
  }

  async getItem(itemId: string): Promise<Item> {
    const item = await createRepositories(this.db).items.get(itemId);
    if (!item) throw new DomainError('not_found', 'Item not found');
    return item;
  }

  async listItems(): Promise<Item[]> {
    return createRepositories(this.db).items.listAll();
  }

  private async addTagToItemInternal(
    repos: ReturnType<typeof createRepositories>,
    itemId: string,
    rawTagName: string,
    commandId: string
  ): Promise<Tag | undefined> {
    const normalized = normalizeTagName(rawTagName);
    let tag = await repos.tags.getByName(normalized);

    if (!tag) {
      tag = {
        id: ulid(),
        name: normalized,
        displayName: toTagDisplayName(normalized),
        createdAt: Date.now()
      };
      await repos.tags.insert(tag);
    }

    const added = await repos.tags.attach(itemId, tag.id, Date.now());
    if (!added) {
      return undefined;
    }

    await repos.events.insert({
      id: ulid(),
      itemId,
      commandId,
      eventType: 'item.tagAdded',
      payloadJson: { tag: normalized },
      occurredAt: Date.now()
    });

    return tag;
  }

  private async filterItems(filter?: QueryFilter): Promise<Item[]> {
    const repos = createRepositories(this.db);
    let items = await repos.items.listAll();

    if (!filter) {
      return items;
    }

    if (filter.includeDone !== true) {
      items = items.filter((item) => item.status !== 'done' && item.status !== 'canceled');
    }

    if (filter.statuses && filter.statuses.length > 0) {
      const allowed = new Set(filter.statuses);
      items = items.filter((item) => allowed.has(item.status));
    }

    if (filter.kinds && filter.kinds.length > 0) {
      const allowed = new Set(filter.kinds);
      items = items.filter((item) => allowed.has(item.kind));
    }

    if (filter.projectIds && filter.projectIds.length > 0) {
      const allowed = new Set(filter.projectIds);
      items = items.filter((item) => item.projectId && allowed.has(item.projectId));
    }

    if (filter.tagAny && filter.tagAny.length > 0) {
      const normalizedAny = filter.tagAny.map(normalizeTagName);
      const namesByItemId = await repos.tags.namesByItemIds(items.map((item) => item.id));
      items = items.filter((item) => {
        const names = namesByItemId.get(item.id) ?? [];
        return normalizedAny.some((name) => names.includes(name));
      });
    }

    if (filter.tagAll && filter.tagAll.length > 0) {
      const normalizedAll = filter.tagAll.map(normalizeTagName);
      const namesByItemId = await repos.tags.namesByItemIds(items.map((item) => item.id));
      items = items.filter((item) => {
        const names = namesByItemId.get(item.id) ?? [];
        return normalizedAll.every((name) => names.includes(name));
      });
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      const namesByItemId = await repos.tags.namesByItemIds(items.map((item) => item.id));
      const projectIds = [...new Set(items.map((item) => item.projectId).filter((id): id is string => Boolean(id)))];
      const projectMap = new Map<string, string>();
      for (const projectId of projectIds) {
        const project = await repos.projects.get(projectId);
        if (project) projectMap.set(projectId, project.title);
      }

      items = items.filter((item) => {
        const tagNames = namesByItemId.get(item.id) ?? [];
        const projectTitle = item.projectId ? projectMap.get(item.projectId) ?? '' : '';
        return (
          item.title.toLowerCase().includes(q) ||
          item.descriptionMd.toLowerCase().includes(q) ||
          tagNames.some((tag) => tag.includes(q)) ||
          projectTitle.toLowerCase().includes(q)
        );
      });
    }

    return items;
  }

  private async activeRows(now: number, includeDone = false): Promise<Array<ItemRowDto & { _meta: { snoozedUntil?: number } }>> {
    const items = await this.filterItems({ includeDone });
    const rows = await this.rowsForItems(items, now);

    const byId = new Map(items.map((item) => [item.id, item]));
    return rows.map((row) => ({
      ...row,
      isOverdue: row.dueAt !== undefined && row.dueAt < now && !isTerminalStatus(row.status),
      _meta: {
        snoozedUntil: byId.get(row.id)?.snoozedUntil
      }
    }));
  }

  private async rowsForItems(items: Item[], now = Date.now()): Promise<ItemRowDto[]> {
    const repos = createRepositories(this.db);
    const itemIds = items.map((item) => item.id);
    const projectIds = [...new Set(items.map((item) => item.projectId).filter((id): id is string => Boolean(id)))];

    const projectMap = new Map<string, Project>();
    for (const projectId of projectIds) {
      const project = await repos.projects.get(projectId);
      if (project) projectMap.set(projectId, project);
    }

    const tagsByItemId = await repos.tags.namesByItemIds(itemIds);
    const linkCounts = await repos.links.countByItemIds(itemIds);
    const attachmentCounts = await repos.attachments.countByItemIds(itemIds);
    const childCounts = await repos.items.childCountByItemIds(itemIds);

    return items.map((item) => {
      const project = item.projectId ? projectMap.get(item.projectId) : undefined;

      return {
        id: item.id,
        title: item.title,
        kind: item.kind,
        status: item.status,
        priority: item.priority,
        project: project ? { id: project.id, title: project.title, slug: project.slug } : undefined,
        tags: tagsByItemId.get(item.id) ?? [],
        dueAt: item.dueAt,
        scheduledAt: item.scheduledAt,
        requestedBy: item.requestedBy,
        isInterruption: item.isInterruption,
        hasLinks: (linkCounts.get(item.id) ?? 0) > 0,
        attachmentCount: attachmentCounts.get(item.id) ?? 0,
        childCount: childCounts.get(item.id) ?? 0,
        isOverdue: item.dueAt !== undefined && item.dueAt < now && !isTerminalStatus(item.status)
      };
    });
  }

  private stripMeta(rows: Array<ItemRowDto & { _meta?: unknown }>): ItemRowDto[] {
    return rows.map((row) => {
      const { _meta: _unused, ...rest } = row as ItemRowDto & { _meta?: unknown };
      return rest;
    });
  }

  private sortTodayRows(rows: ItemRowDto[]): ItemRowDto[] {
    return rows.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      const aDue = a.dueAt ?? Number.MAX_SAFE_INTEGER;
      const bDue = b.dueAt ?? Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;
      const aSched = a.scheduledAt ?? Number.MAX_SAFE_INTEGER;
      const bSched = b.scheduledAt ?? Number.MAX_SAFE_INTEGER;
      if (aSched !== bSched) return aSched - bSched;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.id.localeCompare(b.id);
    });
  }

  private assertTransition(from: ItemStatus, to: ItemStatus): void {
    if (!canTransitionStatus(from, to)) {
      throw new DomainError('conflict', `Illegal status transition: ${from} -> ${to}`);
    }
  }

  private assertSafeUrl(rawUrl: string): void {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new DomainError('validation', 'Invalid URL');
    }

    if (!ALLOWED_LINK_SCHEMES.has(parsed.protocol)) {
      throw new DomainError('validation', 'URL scheme is not allowed');
    }
  }

  private async generateOrderKeyBetweenItems(
    repos: ReturnType<typeof createRepositories>,
    leftItemId?: string,
    rightItemId?: string
  ): Promise<string> {
    const left = leftItemId ? await repos.items.get(leftItemId) : undefined;
    const right = rightItemId ? await repos.items.get(rightItemId) : undefined;

    if (!left && !right) {
      return repos.items.nextOrderKey();
    }

    const leftKey = left?.orderKey;
    const rightKey = right?.orderKey;

    if (!leftKey && rightKey) {
      return `0${rightKey}`;
    }

    if (leftKey && !rightKey) {
      return `${leftKey}z`;
    }

    if (!leftKey || !rightKey) {
      return await repos.items.nextOrderKey();
    }

    let candidate = `${leftKey}m`;
    if (candidate <= leftKey || candidate >= rightKey) {
      candidate = `${leftKey}0`;
    }

    if (candidate <= leftKey || candidate >= rightKey) {
      // TODO(GOTCHA): Order-key midpoint fallback is simplistic; dense reorder ranges may require a stricter fractional-indexing implementation.
      return `${leftKey}zz`;
    }

    return candidate;
  }

  private async generateOrderKeyBetweenProjects(
    repos: ReturnType<typeof createRepositories>,
    leftProjectId?: string,
    rightProjectId?: string
  ): Promise<string> {
    const left = leftProjectId ? await repos.projects.get(leftProjectId) : undefined;
    const right = rightProjectId ? await repos.projects.get(rightProjectId) : undefined;

    if (!left && !right) {
      return repos.projects.nextOrderKey();
    }

    const leftKey = left?.orderKey;
    const rightKey = right?.orderKey;

    if (!leftKey && rightKey) {
      return `0${rightKey}`;
    }

    if (leftKey && !rightKey) {
      return `${leftKey}z`;
    }

    if (!leftKey || !rightKey) {
      return await repos.projects.nextOrderKey();
    }

    let candidate = `${leftKey}m`;
    if (candidate <= leftKey || candidate >= rightKey) {
      candidate = `${leftKey}0`;
    }

    if (candidate <= leftKey || candidate >= rightKey) {
      return `${leftKey}zz`;
    }

    return candidate;
  }
}

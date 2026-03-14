import type {
  Attachment,
  AttachmentContent,
  Item,
  ItemEvent,
  Link,
  Project,
  SavedView,
  Tag,
  UserPreference
} from '../domain/types';
import type {
  AttachmentContentsTable,
  AttachmentsTable,
  ItemEventsTable,
  ItemLinksTable,
  ItemsTable,
  ProjectsTable,
  SavedViewsTable,
  TagsTable,
  UserPreferencesTable
} from '../db/schema';

export const toProject = (row: ProjectsTable): Project => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  descriptionMd: row.description_md,
  status: row.status as Project['status'],
  colorToken: row.color_token ?? undefined,
  icon: row.icon ?? undefined,
  orderKey: row.order_key,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  archivedAt: row.archived_at ?? undefined,
  deletedAt: row.deleted_at ?? undefined
});

export const toItem = (row: ItemsTable): Item => ({
  id: row.id,
  projectId: row.project_id ?? undefined,
  parentItemId: row.parent_item_id ?? undefined,
  kind: row.kind as Item['kind'],
  title: row.title,
  descriptionMd: row.description_md,
  status: row.status as Item['status'],
  priority: row.priority as Item['priority'],
  orderKey: row.order_key,
  scheduledAt: row.scheduled_at ?? undefined,
  dueAt: row.due_at ?? undefined,
  completedAt: row.completed_at ?? undefined,
  snoozedUntil: row.snoozed_until ?? undefined,
  requestedBy: row.requested_by ?? undefined,
  isInterruption: row.is_interruption === 1,
  sourceKind: row.source_kind as Item['sourceKind'],
  sourceRef: row.source_ref ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  deletedAt: row.deleted_at ?? undefined
});

export const toTag = (row: TagsTable): Tag => ({
  id: row.id,
  name: row.name,
  displayName: row.display_name,
  createdAt: row.created_at
});

export const toLink = (row: ItemLinksTable): Link => ({
  id: row.id,
  itemId: row.item_id,
  url: row.url,
  label: row.label ?? undefined,
  kind: row.kind as Link['kind'] | undefined,
  createdAt: row.created_at
});

export const toAttachment = (row: AttachmentsTable): Attachment => ({
  id: row.id,
  itemId: row.item_id,
  storageKey: row.storage_key,
  originalName: row.original_name,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  sha256: row.sha256,
  previewStatus: row.preview_status as Attachment['previewStatus'],
  textExtractionStatus: row.text_extraction_status as Attachment['textExtractionStatus'],
  createdAt: row.created_at,
  deletedAt: row.deleted_at ?? undefined
});

export const toAttachmentContent = (row: AttachmentContentsTable): AttachmentContent => ({
  attachmentId: row.attachment_id,
  textContent: row.text_content,
  contentHash: row.content_hash,
  extractedAt: row.extracted_at
});

export const toEvent = (row: ItemEventsTable): ItemEvent => ({
  id: row.id,
  itemId: row.item_id,
  commandId: row.command_id,
  eventType: row.event_type as ItemEvent['eventType'],
  payloadJson: JSON.parse(row.payload_json),
  occurredAt: row.occurred_at
});

export const toSavedView = (row: SavedViewsTable): SavedView => ({
  id: row.id,
  name: row.name,
  icon: row.icon ?? undefined,
  queryJson: JSON.parse(row.query_json),
  orderKey: row.order_key,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  deletedAt: row.deleted_at ?? undefined
});

export const toUserPreference = (row: UserPreferencesTable): UserPreference => ({
  id: row.id,
  timezone: row.timezone,
  theme: row.theme as UserPreference['theme'],
  density: row.density as UserPreference['density'],
  weekStartsOn: row.week_starts_on as UserPreference['weekStartsOn'],
  defaultProjectId: row.default_project_id ?? undefined,
  todayShowsDone: row.today_shows_done === 1,
  reduceMotion: row.reduce_motion === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

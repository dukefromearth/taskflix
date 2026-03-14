import { sql } from 'kysely';
import { generateInitialOrderKey, generateOrderKeyBetween } from '../domain/order-key';
import type { Item } from '../domain/types';
import { toItem } from './mappers';
import type { DbExecutor } from './repository-types';

type TimelineProjectScope = {
  projectIds: string[];
  includeUnprojected: boolean;
};

const OPEN_ITEM_STATUSES = ['inbox', 'active', 'blocked', 'waiting'] as const;

export class ItemRepository {
  constructor(private readonly db: DbExecutor) {}

  async get(itemId: string): Promise<Item | undefined> {
    const row = await this.db
      .selectFrom('items')
      .selectAll()
      .where('id', '=', itemId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return row ? toItem(row) : undefined;
  }

  async listAll(): Promise<Item[]> {
    const rows = await this.db.selectFrom('items').selectAll().where('deleted_at', 'is', null).execute();
    return rows.map(toItem);
  }

  async listByProject(projectId: string): Promise<Item[]> {
    const rows = await this.db
      .selectFrom('items')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('deleted_at', 'is', null)
      .execute();

    return rows.map(toItem);
  }

  async listByIds(itemIds: string[]): Promise<Item[]> {
    if (itemIds.length === 0) return [];
    const rows = await this.db.selectFrom('items').selectAll().where('id', 'in', itemIds).where('deleted_at', 'is', null).execute();
    return rows.map(toItem);
  }

  async listTimelinePlannedIdsInWindow(input: TimelineProjectScope & { windowStart: number; windowEnd: number }): Promise<string[]> {
    let scheduledQuery = this.db
      .selectFrom('items')
      .select('id')
      .where('deleted_at', 'is', null)
      .where('scheduled_at', '>=', input.windowStart)
      .where('scheduled_at', '<', input.windowEnd);

    let dueQuery = this.db
      .selectFrom('items')
      .select('id')
      .where('deleted_at', 'is', null)
      .where('scheduled_at', 'is', null)
      .where('due_at', '>=', input.windowStart)
      .where('due_at', '<', input.windowEnd);

    if (input.projectIds.length > 0) {
      scheduledQuery = input.includeUnprojected
        ? scheduledQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : scheduledQuery.where('project_id', 'in', input.projectIds);
      dueQuery = input.includeUnprojected
        ? dueQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : dueQuery.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      scheduledQuery = scheduledQuery.where('project_id', 'is', null);
      dueQuery = dueQuery.where('project_id', 'is', null);
    } else {
      return [];
    }

    const [scheduledRows, dueRows] = await Promise.all([scheduledQuery.execute(), dueQuery.execute()]);
    return [...new Set([...scheduledRows.map((row) => row.id), ...dueRows.map((row) => row.id)])];
  }

  async countTimelinePlanByBucket(input: TimelineProjectScope & {
    windowStart: number;
    windowEnd: number;
    bucketSizeMs: number;
    bucketCount: number;
  }): Promise<Map<number, number>> {
    const scheduledBucketIndex = sql<number>`cast(((items.scheduled_at - ${input.windowStart}) / ${input.bucketSizeMs}) as integer)`;
    const dueBucketIndex = sql<number>`cast(((items.due_at - ${input.windowStart}) / ${input.bucketSizeMs}) as integer)`;

    let scheduledQuery = this.db
      .selectFrom('items')
      .select(({ fn }) => [scheduledBucketIndex.as('bucket_index'), fn.count<number>('id').as('count')])
      .where('deleted_at', 'is', null)
      .where('scheduled_at', '>=', input.windowStart)
      .where('scheduled_at', '<', input.windowEnd)
      .groupBy(scheduledBucketIndex);

    let dueQuery = this.db
      .selectFrom('items')
      .select(({ fn }) => [dueBucketIndex.as('bucket_index'), fn.count<number>('id').as('count')])
      .where('deleted_at', 'is', null)
      .where('scheduled_at', 'is', null)
      .where('due_at', '>=', input.windowStart)
      .where('due_at', '<', input.windowEnd)
      .groupBy(dueBucketIndex);

    if (input.projectIds.length > 0) {
      scheduledQuery = input.includeUnprojected
        ? scheduledQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : scheduledQuery.where('project_id', 'in', input.projectIds);
      dueQuery = input.includeUnprojected
        ? dueQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : dueQuery.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      scheduledQuery = scheduledQuery.where('project_id', 'is', null);
      dueQuery = dueQuery.where('project_id', 'is', null);
    } else {
      return new Map();
    }

    const [scheduledRows, dueRows] = await Promise.all([scheduledQuery.execute(), dueQuery.execute()]);
    const output = new Map<number, number>();
    for (const row of [...scheduledRows, ...dueRows]) {
      if (row.bucket_index < 0 || row.bucket_index >= input.bucketCount) continue;
      output.set(row.bucket_index, (output.get(row.bucket_index) ?? 0) + row.count);
    }
    return output;
  }

  async countTimelineOpenDueByBucket(input: TimelineProjectScope & {
    windowStart: number;
    windowEnd: number;
    bucketSizeMs: number;
    bucketCount: number;
  }): Promise<Map<number, number>> {
    const dueBucketIndex = sql<number>`cast(((items.due_at - ${input.windowStart}) / ${input.bucketSizeMs}) as integer)`;

    let baseQuery = this.db
      .selectFrom('items')
      .where('deleted_at', 'is', null)
      .where('due_at', 'is not', null)
      .where('status', 'in', OPEN_ITEM_STATUSES);

    let groupedQuery = this.db
      .selectFrom('items')
      .select(({ fn }) => [dueBucketIndex.as('bucket_index'), fn.count<number>('id').as('count')])
      .where('deleted_at', 'is', null)
      .where('due_at', 'is not', null)
      .where('status', 'in', OPEN_ITEM_STATUSES)
      .where('due_at', '>=', input.windowStart)
      .where('due_at', '<', input.windowEnd)
      .groupBy(dueBucketIndex);

    if (input.projectIds.length > 0) {
      baseQuery = input.includeUnprojected
        ? baseQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : baseQuery.where('project_id', 'in', input.projectIds);
      groupedQuery = input.includeUnprojected
        ? groupedQuery.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : groupedQuery.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      baseQuery = baseQuery.where('project_id', 'is', null);
      groupedQuery = groupedQuery.where('project_id', 'is', null);
    } else {
      return new Map();
    }

    const [baseRow, groupedRows] = await Promise.all([
      baseQuery.where('due_at', '<', input.windowStart).select(({ fn }) => fn.count<number>('id').as('count')).executeTakeFirst(),
      groupedQuery.execute()
    ]);

    const additions = new Array<number>(input.bucketCount).fill(0);
    for (const row of groupedRows) {
      if (row.bucket_index < 0 || row.bucket_index >= input.bucketCount) continue;
      additions[row.bucket_index] = (additions[row.bucket_index] ?? 0) + row.count;
    }

    const output = new Map<number, number>();
    let running = baseRow?.count ?? 0;
    for (let index = 0; index < input.bucketCount; index += 1) {
      running += additions[index] ?? 0;
      output.set(index, running);
    }
    return output;
  }

  async countTimelineInterruptionsByBucket(input: TimelineProjectScope & {
    windowStart: number;
    windowEnd: number;
    bucketSizeMs: number;
    bucketCount: number;
  }): Promise<Map<number, number>> {
    const bucketIndex = sql<number>`cast(((items.created_at - ${input.windowStart}) / ${input.bucketSizeMs}) as integer)`;

    let query = this.db
      .selectFrom('items')
      .select(({ fn }) => [bucketIndex.as('bucket_index'), fn.count<number>('id').as('count')])
      .where('deleted_at', 'is', null)
      .where('is_interruption', '=', 1)
      .where('created_at', '>=', input.windowStart)
      .where('created_at', '<', input.windowEnd)
      .groupBy(bucketIndex);

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : query.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('project_id', 'is', null);
    } else {
      return new Map();
    }

    const rows = await query.execute();
    const output = new Map<number, number>();
    for (const row of rows) {
      if (row.bucket_index < 0 || row.bucket_index >= input.bucketCount) continue;
      output.set(row.bucket_index, row.count);
    }
    return output;
  }

  async countTimelineOpenDueBefore(input: TimelineProjectScope & { dueBefore: number }): Promise<number> {
    let query = this.db
      .selectFrom('items')
      .select(({ fn }) => fn.count<number>('id').as('count'))
      .where('deleted_at', 'is', null)
      .where('due_at', 'is not', null)
      .where('due_at', '<', input.dueBefore)
      .where('status', 'in', OPEN_ITEM_STATUSES);

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : query.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('project_id', 'is', null);
    } else {
      return 0;
    }

    const row = await query.executeTakeFirst();
    return row?.count ?? 0;
  }

  async countTimelineInterruptionsInWindow(input: TimelineProjectScope & { windowStart: number; windowEnd: number }): Promise<number> {
    let query = this.db
      .selectFrom('items')
      .select(({ fn }) => fn.count<number>('id').as('count'))
      .where('deleted_at', 'is', null)
      .where('is_interruption', '=', 1)
      .where('created_at', '>=', input.windowStart)
      .where('created_at', '<=', input.windowEnd);

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('project_id', 'in', input.projectIds), eb('project_id', 'is', null)]))
        : query.where('project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('project_id', 'is', null);
    } else {
      return 0;
    }

    const row = await query.executeTakeFirst();
    return row?.count ?? 0;
  }

  async nextOrderKey(projectId?: string, parentItemId?: string): Promise<string> {
    let query = this.db
      .selectFrom('items')
      .select(['order_key'])
      .where('deleted_at', 'is', null)
      .orderBy('order_key', 'desc')
      .limit(1);

    if (projectId) {
      query = query.where('project_id', '=', projectId);
    } else {
      query = query.where('project_id', 'is', null);
    }

    if (parentItemId) {
      query = query.where('parent_item_id', '=', parentItemId);
    } else {
      query = query.where('parent_item_id', 'is', null);
    }

    const last = await query.executeTakeFirst();
    return last ? generateOrderKeyBetween(last.order_key, undefined) : generateInitialOrderKey();
  }

  async insert(item: Item): Promise<void> {
    await this.db
      .insertInto('items')
      .values({
        id: item.id,
        project_id: item.projectId ?? null,
        parent_item_id: item.parentItemId ?? null,
        kind: item.kind,
        title: item.title,
        description_md: item.descriptionMd,
        status: item.status,
        priority: item.priority,
        order_key: item.orderKey,
        scheduled_at: item.scheduledAt ?? null,
        due_at: item.dueAt ?? null,
        completed_at: item.completedAt ?? null,
        snoozed_until: item.snoozedUntil ?? null,
        requested_by: item.requestedBy ?? null,
        is_interruption: item.isInterruption ? 1 : 0,
        source_kind: item.sourceKind,
        source_ref: item.sourceRef ?? null,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        deleted_at: item.deletedAt ?? null
      })
      .execute();
  }

  async update(item: Item): Promise<void> {
    await this.db
      .updateTable('items')
      .set({
        project_id: item.projectId ?? null,
        parent_item_id: item.parentItemId ?? null,
        kind: item.kind,
        title: item.title,
        description_md: item.descriptionMd,
        status: item.status,
        priority: item.priority,
        order_key: item.orderKey,
        scheduled_at: item.scheduledAt ?? null,
        due_at: item.dueAt ?? null,
        completed_at: item.completedAt ?? null,
        snoozed_until: item.snoozedUntil ?? null,
        requested_by: item.requestedBy ?? null,
        is_interruption: item.isInterruption ? 1 : 0,
        source_kind: item.sourceKind,
        source_ref: item.sourceRef ?? null,
        updated_at: item.updatedAt,
        deleted_at: item.deletedAt ?? null
      })
      .where('id', '=', item.id)
      .execute();
  }

  async childCountByItemIds(itemIds: string[]): Promise<Map<string, number>> {
    if (itemIds.length === 0) return new Map();

    const rows = await this.db
      .selectFrom('items')
      .select(({ fn, ref }) => [ref('parent_item_id').as('parent_item_id'), fn.count<number>('id').as('count')])
      .where('parent_item_id', 'in', itemIds)
      .where('deleted_at', 'is', null)
      .groupBy('parent_item_id')
      .execute();

    const output = new Map<string, number>();
    for (const row of rows) {
      if (!row.parent_item_id) continue;
      output.set(row.parent_item_id, row.count);
    }
    return output;
  }
}

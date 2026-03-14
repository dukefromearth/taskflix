import { sql } from 'kysely';
import type { ItemEvent } from '../domain/types';
import { toEvent } from './mappers';
import type { DbExecutor } from './repository-types';

export class EventRepository {
  constructor(private readonly db: DbExecutor) {}

  async insert(event: ItemEvent): Promise<void> {
    await this.db
      .insertInto('item_events')
      .values({
        id: event.id,
        item_id: event.itemId,
        command_id: event.commandId,
        event_type: event.eventType,
        payload_json: JSON.stringify(event.payloadJson),
        occurred_at: event.occurredAt
      })
      .execute();
  }

  async listAll(limit = 500): Promise<ItemEvent[]> {
    const rows = await this.db.selectFrom('item_events').selectAll().orderBy('occurred_at', 'desc').limit(limit).execute();
    return rows.map(toEvent);
  }

  async listTimelineRecentEventsInBucket(input: {
    windowStart: number;
    windowEnd: number;
    eventTypes?: string[];
    projectIds: string[];
    includeUnprojected: boolean;
    limit: number;
  }): Promise<ItemEvent[]> {
    let query = this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select('item_events.id as id')
      .select('item_events.item_id as item_id')
      .select('item_events.command_id as command_id')
      .select('item_events.event_type as event_type')
      .select('item_events.payload_json as payload_json')
      .select('item_events.occurred_at as occurred_at')
      .where('items.deleted_at', 'is', null)
      .where('item_events.occurred_at', '>=', input.windowStart)
      .where('item_events.occurred_at', '<=', input.windowEnd)
      .orderBy('item_events.occurred_at', 'desc')
      .limit(input.limit);

    if (input.eventTypes && input.eventTypes.length > 0) {
      query = query.where('item_events.event_type', 'in', input.eventTypes);
    }

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('items.project_id', 'in', input.projectIds), eb('items.project_id', 'is', null)]))
        : query.where('items.project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('items.project_id', 'is', null);
    } else {
      return [];
    }

    const rows = await query.execute();
    return rows.map((row) =>
      toEvent({
        id: row.id,
        item_id: row.item_id,
        command_id: row.command_id,
        event_type: row.event_type,
        payload_json: row.payload_json,
        occurred_at: row.occurred_at
      })
    );
  }

  async listTimelineDistinctRealityItemIdsInBucket(input: {
    windowStart: number;
    windowEnd: number;
    eventTypes?: string[];
    projectIds: string[];
    includeUnprojected: boolean;
    limit?: number;
  }): Promise<string[]> {
    let query = this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select('item_events.item_id as item_id')
      .distinct()
      .where('items.deleted_at', 'is', null)
      .where('item_events.occurred_at', '>=', input.windowStart)
      .where('item_events.occurred_at', '<=', input.windowEnd);

    if (input.eventTypes && input.eventTypes.length > 0) {
      query = query.where('item_events.event_type', 'in', input.eventTypes);
    }

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('items.project_id', 'in', input.projectIds), eb('items.project_id', 'is', null)]))
        : query.where('items.project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('items.project_id', 'is', null);
    } else {
      return [];
    }

    if (input.limit !== undefined && input.limit > 0) {
      query = query.limit(input.limit);
    }

    const rows = await query.execute();
    return rows.map((row) => row.item_id);
  }

  async countTimelineEventsInWindow(input: {
    windowStart: number;
    windowEnd: number;
    eventTypes?: string[];
    projectIds: string[];
    includeUnprojected: boolean;
  }): Promise<number> {
    let query = this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select(({ fn }) => fn.count<number>('item_events.id').as('count'))
      .where('items.deleted_at', 'is', null)
      .where('item_events.occurred_at', '>=', input.windowStart)
      .where('item_events.occurred_at', '<=', input.windowEnd);

    if (input.eventTypes && input.eventTypes.length > 0) {
      query = query.where('item_events.event_type', 'in', input.eventTypes);
    }

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('items.project_id', 'in', input.projectIds), eb('items.project_id', 'is', null)]))
        : query.where('items.project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('items.project_id', 'is', null);
    } else {
      return 0;
    }

    const row = await query.executeTakeFirst();
    return row?.count ?? 0;
  }

  async countTimelineInterruptionCreatedEventsInBucket(input: {
    windowStart: number;
    windowEnd: number;
    projectIds: string[];
    includeUnprojected: boolean;
  }): Promise<number> {
    let query = this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select(({ fn }) => fn.count<number>('item_events.id').as('count'))
      .where('items.deleted_at', 'is', null)
      .where('items.is_interruption', '=', 1)
      .where('item_events.event_type', '=', 'item.created')
      .where('item_events.occurred_at', '>=', input.windowStart)
      .where('item_events.occurred_at', '<=', input.windowEnd);

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('items.project_id', 'in', input.projectIds), eb('items.project_id', 'is', null)]))
        : query.where('items.project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('items.project_id', 'is', null);
    } else {
      return 0;
    }

    const row = await query.executeTakeFirst();
    return row?.count ?? 0;
  }

  async countTimelineByBucket(input: {
    windowStart: number;
    windowEnd: number;
    bucketSizeMs: number;
    bucketCount: number;
    eventTypes?: string[];
    projectIds: string[];
    includeUnprojected: boolean;
  }): Promise<Map<number, number>> {
    const bucketIndex = sql<number>`cast(((item_events.occurred_at - ${input.windowStart}) / ${input.bucketSizeMs}) as integer)`;
    let query = this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select(({ fn }) => [bucketIndex.as('bucket_index'), fn.count<number>('item_events.id').as('count')])
      .where('items.deleted_at', 'is', null)
      .where('item_events.occurred_at', '>=', input.windowStart)
      .where('item_events.occurred_at', '<', input.windowEnd)
      .groupBy(bucketIndex);

    if (input.eventTypes && input.eventTypes.length > 0) {
      query = query.where('item_events.event_type', 'in', input.eventTypes);
    }

    if (input.projectIds.length > 0) {
      query = input.includeUnprojected
        ? query.where((eb) => eb.or([eb('items.project_id', 'in', input.projectIds), eb('items.project_id', 'is', null)]))
        : query.where('items.project_id', 'in', input.projectIds);
    } else if (input.includeUnprojected) {
      query = query.where('items.project_id', 'is', null);
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

  async listByProject(projectId: string, limit = 100): Promise<ItemEvent[]> {
    const rows = await this.db
      .selectFrom('item_events')
      .innerJoin('items', 'items.id', 'item_events.item_id')
      .select('item_events.id as id')
      .select('item_events.item_id as item_id')
      .select('item_events.command_id as command_id')
      .select('item_events.event_type as event_type')
      .select('item_events.payload_json as payload_json')
      .select('item_events.occurred_at as occurred_at')
      .where('items.project_id', '=', projectId)
      .orderBy('item_events.occurred_at', 'desc')
      .limit(limit)
      .execute();

    return rows.map((row) =>
      toEvent({
        id: row.id,
        item_id: row.item_id,
        command_id: row.command_id,
        event_type: row.event_type,
        payload_json: row.payload_json,
        occurred_at: row.occurred_at
      })
    );
  }

  async listByItemId(itemId: string, limit = 100): Promise<ItemEvent[]> {
    const rows = await this.db
      .selectFrom('item_events')
      .selectAll()
      .where('item_id', '=', itemId)
      .orderBy('occurred_at', 'desc')
      .limit(limit)
      .execute();

    return rows.map(toEvent);
  }
}

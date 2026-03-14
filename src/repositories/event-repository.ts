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

import { generateInitialOrderKey, generateOrderKeyBetween } from '../domain/order-key';
import type { Item } from '../domain/types';
import { toItem } from './mappers';
import type { DbExecutor } from './repository-types';

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

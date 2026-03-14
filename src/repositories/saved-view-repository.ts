import { generateInitialOrderKey, generateOrderKeyBetween } from '../domain/order-key';
import type { SavedView } from '../domain/types';
import { toSavedView } from './mappers';
import type { DbExecutor } from './repository-types';

export class SavedViewRepository {
  constructor(private readonly db: DbExecutor) {}

  async list(): Promise<SavedView[]> {
    const rows = await this.db
      .selectFrom('saved_views')
      .selectAll()
      .where('deleted_at', 'is', null)
      .orderBy('order_key', 'asc')
      .execute();

    return rows.map(toSavedView);
  }

  async get(savedViewId: string): Promise<SavedView | undefined> {
    const row = await this.db
      .selectFrom('saved_views')
      .selectAll()
      .where('id', '=', savedViewId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return row ? toSavedView(row) : undefined;
  }

  async nextOrderKey(): Promise<string> {
    const last = await this.db
      .selectFrom('saved_views')
      .select(['order_key'])
      .where('deleted_at', 'is', null)
      .orderBy('order_key', 'desc')
      .executeTakeFirst();

    return last ? generateOrderKeyBetween(last.order_key, undefined) : generateInitialOrderKey();
  }

  async insert(view: SavedView): Promise<void> {
    await this.db
      .insertInto('saved_views')
      .values({
        id: view.id,
        name: view.name,
        icon: view.icon ?? null,
        query_json: JSON.stringify(view.queryJson),
        order_key: view.orderKey,
        created_at: view.createdAt,
        updated_at: view.updatedAt,
        deleted_at: view.deletedAt ?? null
      })
      .execute();
  }

  async update(view: SavedView): Promise<void> {
    await this.db
      .updateTable('saved_views')
      .set({
        name: view.name,
        icon: view.icon ?? null,
        query_json: JSON.stringify(view.queryJson),
        order_key: view.orderKey,
        updated_at: view.updatedAt,
        deleted_at: view.deletedAt ?? null
      })
      .where('id', '=', view.id)
      .execute();
  }
}

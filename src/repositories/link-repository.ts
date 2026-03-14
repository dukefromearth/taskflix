import type { Link } from '../domain/types';
import { toLink } from './mappers';
import type { DbExecutor } from './repository-types';

export class LinkRepository {
  constructor(private readonly db: DbExecutor) {}

  async insert(link: Link): Promise<void> {
    await this.db
      .insertInto('item_links')
      .values({
        id: link.id,
        item_id: link.itemId,
        url: link.url,
        label: link.label ?? null,
        kind: link.kind ?? null,
        created_at: link.createdAt
      })
      .execute();
  }

  async countByItemIds(itemIds: string[]): Promise<Map<string, number>> {
    const output = new Map<string, number>();
    for (const id of itemIds) output.set(id, 0);
    if (itemIds.length === 0) return output;

    const rows = await this.db
      .selectFrom('item_links')
      .select(({ fn, ref }) => [ref('item_id').as('item_id'), fn.count<number>('id').as('count')])
      .where('item_id', 'in', itemIds)
      .groupBy('item_id')
      .execute();

    for (const row of rows) {
      output.set(row.item_id, row.count);
    }

    return output;
  }

  async listByItemId(itemId: string): Promise<Link[]> {
    const rows = await this.db.selectFrom('item_links').selectAll().where('item_id', '=', itemId).orderBy('created_at', 'desc').execute();
    return rows.map(toLink);
  }
}

import type { Tag } from '../domain/types';
import { toTag } from './mappers';
import type { DbExecutor } from './repository-types';

export class TagRepository {
  constructor(private readonly db: DbExecutor) {}

  async getByName(name: string): Promise<Tag | undefined> {
    const row = await this.db.selectFrom('tags').selectAll().where('name', '=', name).executeTakeFirst();
    return row ? toTag(row) : undefined;
  }

  async insert(tag: Tag): Promise<void> {
    await this.db
      .insertInto('tags')
      .values({
        id: tag.id,
        name: tag.name,
        display_name: tag.displayName,
        created_at: tag.createdAt
      })
      .execute();
  }

  async attach(itemId: string, tagId: string, createdAt: number): Promise<boolean> {
    const result = await this.db
      .insertInto('item_tags')
      .values({
        item_id: itemId,
        tag_id: tagId,
        created_at: createdAt
      })
      .onConflict((oc) => oc.columns(['item_id', 'tag_id']).doNothing())
      .executeTakeFirst();

    return Number(result.numInsertedOrUpdatedRows ?? 0) > 0;
  }

  async detach(itemId: string, tagId: string): Promise<boolean> {
    const result = await this.db.deleteFrom('item_tags').where('item_id', '=', itemId).where('tag_id', '=', tagId).executeTakeFirst();
    return Number(result.numDeletedRows ?? 0) > 0;
  }

  async namesForItem(itemId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom('item_tags')
      .innerJoin('tags', 'tags.id', 'item_tags.tag_id')
      .select(['tags.name'])
      .where('item_tags.item_id', '=', itemId)
      .orderBy('tags.name', 'asc')
      .execute();

    return rows.map((row) => row.name);
  }

  async listByItemId(itemId: string): Promise<Tag[]> {
    const rows = await this.db
      .selectFrom('item_tags')
      .innerJoin('tags', 'tags.id', 'item_tags.tag_id')
      .select(['tags.id', 'tags.name', 'tags.display_name', 'tags.created_at'])
      .where('item_tags.item_id', '=', itemId)
      .orderBy('tags.name', 'asc')
      .execute();

    return rows.map(toTag);
  }

  async namesByItemIds(itemIds: string[]): Promise<Map<string, string[]>> {
    const output = new Map<string, string[]>();
    for (const id of itemIds) output.set(id, []);
    if (itemIds.length === 0) return output;

    const rows = await this.db
      .selectFrom('item_tags')
      .innerJoin('tags', 'tags.id', 'item_tags.tag_id')
      .select(['item_tags.item_id', 'tags.name'])
      .where('item_tags.item_id', 'in', itemIds)
      .orderBy('tags.name', 'asc')
      .execute();

    for (const row of rows) {
      const list = output.get(row.item_id) ?? [];
      list.push(row.name);
      output.set(row.item_id, list);
    }

    return output;
  }
}

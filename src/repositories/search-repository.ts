import { sql } from 'kysely';
import type { DbExecutor } from './repository-types';

type SearchHit = {
  itemId: string;
  rank: number;
};

export class SearchRepository {
  constructor(private readonly db: DbExecutor) {}

  async upsertItemDocument(itemId: string): Promise<void> {
    const payload = await this.buildPayload(itemId);

    await this.db.deleteFrom('items_fts').where('item_id', '=', itemId).execute();

    if (!payload) {
      return;
    }

    await this.db
      .insertInto('items_fts')
      .values({
        item_id: itemId,
        title: payload.title,
        description: payload.description,
        project_title: payload.projectTitle,
        tag_names: payload.tagNames,
        attachment_text: payload.attachmentText
      })
      .execute();
  }

  async removeItemDocument(itemId: string): Promise<void> {
    await this.db.deleteFrom('items_fts').where('item_id', '=', itemId).execute();
  }

  async rebuildAll(): Promise<void> {
    await this.db.deleteFrom('items_fts').execute();

    const rows = await this.db.selectFrom('items').select(['id']).where('deleted_at', 'is', null).execute();
    for (const row of rows) {
      await this.upsertItemDocument(row.id);
    }
  }

  async search(query: string, limit = 100): Promise<SearchHit[]> {
    const normalizedQuery = query.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    if (normalizedQuery.length === 0) return [];

    const rows = await this.db
      .selectFrom('items_fts')
      .select(['item_id'])
      .select(sql<number>`bm25(items_fts, 10.0, 4.0, 6.0, 6.0, 2.0)`.as('rank'))
      .where(sql<boolean>`items_fts MATCH ${normalizedQuery}`)
      .orderBy('rank', 'asc')
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      itemId: row.item_id,
      rank: Number(row.rank)
    }));
  }

  private async buildPayload(
    itemId: string
  ): Promise<
    | {
        title: string;
        description: string;
        projectTitle: string;
        tagNames: string;
        attachmentText: string;
      }
    | undefined
  > {
    const item = await this.db
      .selectFrom('items')
      .select(['id', 'title', 'description_md', 'project_id'])
      .where('id', '=', itemId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!item) return undefined;

    const project = item.project_id
      ? await this.db.selectFrom('projects').select(['title']).where('id', '=', item.project_id).executeTakeFirst()
      : undefined;

    const tags = await this.db
      .selectFrom('item_tags')
      .innerJoin('tags', 'tags.id', 'item_tags.tag_id')
      .select(['tags.name'])
      .where('item_tags.item_id', '=', itemId)
      .execute();

    const attachmentTexts = await this.db
      .selectFrom('attachments')
      .innerJoin('attachment_contents', 'attachment_contents.attachment_id', 'attachments.id')
      .select(['attachment_contents.text_content'])
      .where('attachments.item_id', '=', itemId)
      .where('attachments.deleted_at', 'is', null)
      .execute();

    return {
      title: item.title,
      description: item.description_md,
      projectTitle: project?.title ?? '',
      tagNames: tags.map((row) => row.name).join(' '),
      attachmentText: attachmentTexts.map((row) => row.text_content).join('\n')
    };
  }
}

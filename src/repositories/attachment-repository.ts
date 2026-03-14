import type { Attachment, AttachmentContent } from '../domain/types';
import { toAttachment, toAttachmentContent } from './mappers';
import type { DbExecutor } from './repository-types';

export class AttachmentRepository {
  constructor(private readonly db: DbExecutor) {}

  async insert(attachment: Attachment): Promise<void> {
    await this.db
      .insertInto('attachments')
      .values({
        id: attachment.id,
        item_id: attachment.itemId,
        storage_key: attachment.storageKey,
        original_name: attachment.originalName,
        mime_type: attachment.mimeType,
        size_bytes: attachment.sizeBytes,
        sha256: attachment.sha256,
        preview_status: attachment.previewStatus,
        text_extraction_status: attachment.textExtractionStatus,
        created_at: attachment.createdAt,
        deleted_at: attachment.deletedAt ?? null
      })
      .execute();
  }

  async get(attachmentId: string): Promise<Attachment | undefined> {
    const row = await this.db
      .selectFrom('attachments')
      .selectAll()
      .where('id', '=', attachmentId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    return row ? toAttachment(row) : undefined;
  }

  async update(attachment: Attachment): Promise<void> {
    await this.db
      .updateTable('attachments')
      .set({
        item_id: attachment.itemId,
        storage_key: attachment.storageKey,
        original_name: attachment.originalName,
        mime_type: attachment.mimeType,
        size_bytes: attachment.sizeBytes,
        sha256: attachment.sha256,
        preview_status: attachment.previewStatus,
        text_extraction_status: attachment.textExtractionStatus,
        deleted_at: attachment.deletedAt ?? null
      })
      .where('id', '=', attachment.id)
      .execute();
  }

  async listByItemIds(itemIds: string[]): Promise<Map<string, Attachment[]>> {
    const output = new Map<string, Attachment[]>();
    for (const id of itemIds) output.set(id, []);
    if (itemIds.length === 0) return output;

    const rows = await this.db
      .selectFrom('attachments')
      .selectAll()
      .where('item_id', 'in', itemIds)
      .where('deleted_at', 'is', null)
      .execute();

    for (const row of rows) {
      const list = output.get(row.item_id) ?? [];
      list.push(toAttachment(row));
      output.set(row.item_id, list);
    }

    return output;
  }

  async listByItemId(itemId: string): Promise<Attachment[]> {
    const rows = await this.db
      .selectFrom('attachments')
      .selectAll()
      .where('item_id', '=', itemId)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();

    return rows.map(toAttachment);
  }

  async countByItemIds(itemIds: string[]): Promise<Map<string, number>> {
    const output = new Map<string, number>();
    for (const id of itemIds) output.set(id, 0);
    if (itemIds.length === 0) return output;

    const rows = await this.db
      .selectFrom('attachments')
      .select(({ fn, ref }) => [ref('item_id').as('item_id'), fn.count<number>('id').as('count')])
      .where('item_id', 'in', itemIds)
      .where('deleted_at', 'is', null)
      .groupBy('item_id')
      .execute();

    for (const row of rows) {
      output.set(row.item_id, row.count);
    }

    return output;
  }

  async upsertContent(content: AttachmentContent): Promise<void> {
    await this.db
      .insertInto('attachment_contents')
      .values({
        attachment_id: content.attachmentId,
        text_content: content.textContent,
        content_hash: content.contentHash,
        extracted_at: content.extractedAt
      })
      .onConflict((oc) =>
        oc.column('attachment_id').doUpdateSet({
          text_content: content.textContent,
          content_hash: content.contentHash,
          extracted_at: content.extractedAt
        })
      )
      .execute();
  }

  async contentByAttachmentId(attachmentId: string): Promise<AttachmentContent | undefined> {
    const row = await this.db
      .selectFrom('attachment_contents')
      .selectAll()
      .where('attachment_id', '=', attachmentId)
      .executeTakeFirst();

    return row ? toAttachmentContent(row) : undefined;
  }

  async attachmentTextByItemId(itemId: string): Promise<string> {
    const rows = await this.db
      .selectFrom('attachments')
      .innerJoin('attachment_contents', 'attachment_contents.attachment_id', 'attachments.id')
      .select(['attachment_contents.text_content'])
      .where('attachments.item_id', '=', itemId)
      .where('attachments.deleted_at', 'is', null)
      .execute();

    return rows.map((row) => row.text_content).join('\n');
  }
}

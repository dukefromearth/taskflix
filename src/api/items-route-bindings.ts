import { createHash } from 'node:crypto';
import { ulid } from 'ulid';
import { ApiHttpError } from '@/api/contracts';
import { getService, getStorage } from '@/api/service-context';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const listItemsRoute = bindRoute(getEndpoint('items.list'), async () => {
  const service = await getService();
  return { data: await service.listItems() };
});

export const createItemRoute = bindRoute(getEndpoint('items.create'), async ({ body }) => {
  const service = await getService();
  return { data: await service.createItem(body), status: 201 };
});

export const reorderItemsRoute = bindRoute(getEndpoint('items.reorder'), async ({ body }) => {
  const service = await getService();
  return { data: await service.reorderItems(body) };
});

export const getItemRoute = bindRoute(getEndpoint('items.get'), async ({ params }) => {
  const service = await getService();
  return { data: await service.getItem(params.itemId) };
});

export const updateItemRoute = bindRoute(getEndpoint('items.update'), async ({ params, body }) => {
  const service = await getService();
  return { data: await service.updateItem(params.itemId, body) };
});

export const deleteItemRoute = bindRoute(getEndpoint('items.delete'), async ({ params }) => {
  const service = await getService();
  await service.deleteItem(params.itemId);
  return { data: { deleted: true as const } };
});

export const getItemDetailRoute = bindRoute(getEndpoint('items.detail'), async ({ params }) => {
  const service = await getService();
  return { data: await service.getItemDetail(params.itemId) };
});

export const completeItemRoute = bindRoute(getEndpoint('items.complete'), async ({ params }) => {
  const service = await getService();
  return { data: await service.changeItemStatus(params.itemId, 'done') };
});

export const deferItemRoute = bindRoute(getEndpoint('items.defer'), async ({ params, body }) => {
  const service = await getService();
  return { data: await service.deferItem(params.itemId, body.snoozedUntil) };
});

export const scheduleItemRoute = bindRoute(getEndpoint('items.schedule'), async ({ params, body }) => {
  const service = await getService();
  return { data: await service.scheduleItem(params.itemId, body.scheduledAt, body.dueAt) };
});

export const statusItemRoute = bindRoute(getEndpoint('items.status'), async ({ params, body }) => {
  const service = await getService();
  return { data: await service.changeItemStatus(params.itemId, body.to, undefined, body.reason) };
});

export const tagsItemRoute = bindRoute(getEndpoint('items.tags'), async ({ params, body }) => {
  const service = await getService();

  for (const tag of body.add ?? []) {
    await service.addTagToItem(params.itemId, tag);
  }
  for (const tag of body.remove ?? []) {
    await service.removeTagFromItem(params.itemId, tag);
  }

  return { data: { updated: true as const } };
});

export const linksItemRoute = bindRoute(getEndpoint('items.links'), async ({ params, body }) => {
  const service = await getService();
  return {
    data: await service.addLink(params.itemId, body),
    status: 201
  };
});

export const attachmentsItemRoute = bindRoute(getEndpoint('items.attachments.upload'), async ({ params, body }) => {
  const service = await getService();
  const storage = getStorage();

  const fileBuffer = Buffer.from(body.contentBase64, 'base64');
  const maxBytes = Number(process.env.MAX_UPLOAD_BYTES ?? 50 * 1024 * 1024);
  if (fileBuffer.length > maxBytes) {
    throw new ApiHttpError(413, 'PAYLOAD_TOO_LARGE', 'Payload too large', { maxBytes });
  }

  const key = `${params.itemId}/${ulid()}`;
  await storage.put({
    key,
    body: fileBuffer,
    contentType: body.mimeType
  });

  const attachment = await service.addAttachment({
    itemId: params.itemId,
    storageKey: key,
    originalName: body.originalName,
    mimeType: body.mimeType,
    sizeBytes: fileBuffer.length,
    sha256: createHash('sha256').update(fileBuffer).digest('hex')
  });

  // TODO(GOTCHA): Extraction remains synchronous for text-like content and should move to async workers once queue infrastructure exists.
  if (body.mimeType.startsWith('text/') || body.mimeType === 'application/json') {
    await service.setAttachmentContent(attachment.id, fileBuffer.toString('utf8'));
  }

  return {
    data: attachment,
    status: 201
  };
});

import { NextResponse } from 'next/server';
import { getService, getStorage } from '@/api/service-context';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const getAttachmentRoute = bindRoute(getEndpoint('attachments.get'), async ({ params }) => {
  const service = await getService();
  const storage = getStorage();
  const attachment = await service.getAttachment(params.attachmentId);
  const readUrl = await storage.getSignedReadUrl(attachment.storageKey);
  return { data: { ...attachment, readUrl } };
});

export const deleteAttachmentRoute = bindRoute(getEndpoint('attachments.delete'), async ({ params }) => {
  const service = await getService();
  const storage = getStorage();
  const attachment = await service.getAttachment(params.attachmentId);
  await service.deleteAttachment(params.attachmentId);
  await storage.delete(attachment.storageKey);
  return { data: { deleted: true as const } };
});

export const downloadAttachmentRoute = bindRoute(getEndpoint('attachments.download'), async ({ params }) => {
  const service = await getService();
  const storage = getStorage();
  const attachment = await service.getAttachment(params.attachmentId);
  const readUrl = await storage.getSignedReadUrl(attachment.storageKey);
  return NextResponse.redirect(readUrl);
});

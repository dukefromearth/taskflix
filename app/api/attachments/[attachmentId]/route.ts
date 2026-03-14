import { z } from 'zod';
import { getService, getStorage } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';

const ParamsSchema = z.object({ attachmentId: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    const storage = getStorage();
    const attachment = await service.getAttachment(params.attachmentId);
    const readUrl = await storage.getSignedReadUrl(attachment.storageKey);
    return jsonOk({ ...attachment, readUrl });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    const storage = getStorage();
    const attachment = await service.getAttachment(params.attachmentId);
    await service.deleteAttachment(params.attachmentId);
    await storage.delete(attachment.storageKey);
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

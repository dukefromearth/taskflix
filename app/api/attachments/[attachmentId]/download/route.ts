import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getService, getStorage } from '@/api/service-context';
import { handleRouteError, parseOrThrow } from '@/api/next-helpers';

const ParamsSchema = z.object({ attachmentId: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    const storage = getStorage();
    const attachment = await service.getAttachment(params.attachmentId);
    const readUrl = await storage.getSignedReadUrl(attachment.storageKey);
    return NextResponse.redirect(readUrl);
  } catch (error) {
    return handleRouteError(error);
  }
}

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ulid } from 'ulid';
import { z } from 'zod';
import { ApiHttpError, ok } from '@/api/contracts';
import { Base64Schema, MimeTypeSchema } from '@/api/schemas';
import { getService, getStorage } from '@/api/service-context';
import { handleRouteError, parseOrThrow, parseRequestJson, withIdempotency } from '@/api/next-helpers';

const ParamsSchema = z.object({ itemId: z.string().min(1) });
const BodySchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  mimeType: MimeTypeSchema,
  contentBase64: Base64Schema
});

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    const storage = getStorage();

    const response = await withIdempotency(request, 'attachment.upload', async () => {
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
        status: 201,
        payload: ok(attachment)
      };
    });

    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { z } from 'zod';
import { getService } from '@/api/service-context';
import { TimestampSchema } from '@/api/schemas';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';

const ParamsSchema = z.object({ itemId: z.string().min(1) });
const BodySchema = z.object({ scheduledAt: TimestampSchema.optional(), dueAt: TimestampSchema.optional() });

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.scheduleItem(params.itemId, body.scheduledAt, body.dueAt));
  } catch (error) {
    return handleRouteError(error);
  }
}

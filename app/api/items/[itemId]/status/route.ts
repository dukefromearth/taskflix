import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';
import { ItemStatusSchema } from '@/api/schemas';

const ParamsSchema = z.object({ itemId: z.string().min(1) });
const BodySchema = z.object({ to: ItemStatusSchema, reason: z.string().max(500).optional() });

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.changeItemStatus(params.itemId, body.to, undefined, body.reason));
  } catch (error) {
    return handleRouteError(error);
  }
}

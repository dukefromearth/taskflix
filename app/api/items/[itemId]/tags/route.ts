import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';

const ParamsSchema = z.object({ itemId: z.string().min(1) });
const BodySchema = z.object({
  add: z.array(z.string().min(1).max(120)).max(200).optional(),
  remove: z.array(z.string().min(1).max(120)).max(200).optional()
});

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();

    for (const tag of body.add ?? []) {
      await service.addTagToItem(params.itemId, tag);
    }
    for (const tag of body.remove ?? []) {
      await service.removeTagFromItem(params.itemId, tag);
    }

    return jsonOk({ updated: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

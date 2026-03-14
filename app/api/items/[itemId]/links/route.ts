import { z } from 'zod';
import { getService } from '@/api/service-context';
import { LinkKindSchema } from '@/api/schemas';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';

const ParamsSchema = z.object({ itemId: z.string().min(1) });
const BodySchema = z.object({
  url: z.string().url().max(2048),
  label: z.string().trim().min(1).max(200).optional(),
  kind: LinkKindSchema.optional()
});

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.addLink(params.itemId, body), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

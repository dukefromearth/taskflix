import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';

const ParamsSchema = z.object({ itemId: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    return jsonOk(await service.getItemDetail(params.itemId));
  } catch (error) {
    return handleRouteError(error);
  }
}

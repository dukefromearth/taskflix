import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseRequestJson } from '@/api/next-helpers';

const BodySchema = z.object({
  itemId: z.string().min(1),
  leftItemId: z.string().min(1).optional(),
  rightItemId: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.reorderItems(body));
  } catch (error) {
    return handleRouteError(error);
  }
}

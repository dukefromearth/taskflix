import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';
import { ItemPatchSchema } from '@/api/schemas';

const ParamsSchema = z.object({ itemId: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    return jsonOk(await service.getItem(params.itemId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, ItemPatchSchema);
    const service = await getService();
    return jsonOk(await service.updateItem(params.itemId, body));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    await service.deleteItem(params.itemId);
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

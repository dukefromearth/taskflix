import { z } from 'zod';
import type { QueryFilter } from '@/domain/types';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson } from '@/api/next-helpers';

const ParamsSchema = z.object({ savedViewId: z.string().min(1) });
const BodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  icon: z.string().trim().min(1).max(64).optional(),
  queryJson: z.record(z.string(), z.unknown()).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ savedViewId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.updateSavedView(params.savedViewId, body as { name?: string; icon?: string; queryJson?: QueryFilter }));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ savedViewId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    await service.deleteSavedView(params.savedViewId);
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

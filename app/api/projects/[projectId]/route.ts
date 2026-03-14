import { jsonOk, handleRouteError, parseOrThrow, parseRequestJson } from '@/api/next-helpers';
import { getService } from '@/api/service-context';
import { ProjectPatchSchema } from '@/api/schemas';
import { z } from 'zod';

const ParamsSchema = z.object({ projectId: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    return jsonOk(await service.getProject(params.projectId));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const body = await parseRequestJson(request, ProjectPatchSchema);
    const service = await getService();
    return jsonOk(await service.updateProject(params.projectId, body));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();
    return jsonOk(await service.deleteProject(params.projectId));
  } catch (error) {
    return handleRouteError(error);
  }
}

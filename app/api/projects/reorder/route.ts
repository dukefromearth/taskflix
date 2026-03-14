import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseRequestJson } from '@/api/next-helpers';

const BodySchema = z.object({
  projectId: z.string().min(1),
  leftProjectId: z.string().min(1).optional(),
  rightProjectId: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.reorderProjects(body));
  } catch (error) {
    return handleRouteError(error);
  }
}

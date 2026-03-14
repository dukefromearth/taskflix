import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';

const ParamsSchema = z.object({ name: z.enum(['today', 'upcoming', 'inbox', 'history', 'project']) });

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const { searchParams } = new URL(request.url);
    const now = Number(searchParams.get('now') ?? Date.now());
    const service = await getService();

    if (params.name === 'today') return jsonOk(await service.getTodayView(now));
    if (params.name === 'upcoming') return jsonOk(await service.getUpcomingView(now));
    if (params.name === 'inbox') return jsonOk(await service.getInboxView(now));
    if (params.name === 'history') return jsonOk(await service.getHistoryView(now));

    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return jsonOk({ ok: false, error: 'projectId query is required for project view' }, { status: 400 });
    }
    return jsonOk(await service.getProjectView(projectId, now));
  } catch (error) {
    return handleRouteError(error);
  }
}

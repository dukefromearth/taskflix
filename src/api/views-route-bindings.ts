import { getService } from '@/api/service-context';
import { parseViewNow } from '@/contracts/ontology/views';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const getViewRoute = bindRoute(getEndpoint('views.get'), async ({ params, query }) => {
  const service = await getService();
  const now = parseViewNow(query.now);

  if (params.name === 'today') return { data: await service.getTodayView(now) };
  if (params.name === 'upcoming') return { data: await service.getUpcomingView(now) };
  if (params.name === 'inbox') return { data: await service.getInboxView(now) };
  if (params.name === 'history') return { data: await service.getHistoryView(now) };

  if (!query.projectId) {
    return { data: { ok: false as const, error: 'projectId query is required for project view' }, status: 400 };
  }

  return { data: await service.getProjectView(query.projectId, now) };
});

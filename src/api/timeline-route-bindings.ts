import { getService } from '@/api/service-context';
import { parseTimelineStructureQuery, parseTimelineSummaryQuery } from '@/contracts/ontology/timeline';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const timelineStructureRoute = bindRoute(getEndpoint('timeline.structure'), async ({ query }) => {
  const service = await getService();
  return {
    data: await service.getTimelineStructure(parseTimelineStructureQuery(query))
  };
});

export const timelineSummaryRoute = bindRoute(getEndpoint('timeline.summary'), async ({ query }) => {
  const service = await getService();
  return {
    data: await service.getTimelineSummary(parseTimelineSummaryQuery(query))
  };
});

import { TimelineStructureSchema, TimelineSummarySchema } from '@/contracts/entities';
import { TimelineStructureQuerySchema, TimelineSummaryQuerySchema } from '@/contracts/ontology/timeline';
import { defineEndpoint } from '@/contracts/types';

export const timelineEndpoints = [
  defineEndpoint({
    id: 'timeline.structure',
    method: 'GET',
    path: '/api/timeline/structure',
    description: 'Fetch timeline structure (lanes/moments).',
    request: {
      query: TimelineStructureQuerySchema
    },
    response: {
      kind: 'json',
      success: TimelineStructureSchema,
      successStatus: 200
    },
    metadata: { tags: ['timeline'] }
  }),
  defineEndpoint({
    id: 'timeline.summary',
    method: 'GET',
    path: '/api/timeline/summary',
    description: 'Fetch focused timeline summary metrics.',
    request: {
      query: TimelineSummaryQuerySchema
    },
    response: {
      kind: 'json',
      success: TimelineSummarySchema,
      successStatus: 200
    },
    metadata: { tags: ['timeline'] }
  })
] as const;

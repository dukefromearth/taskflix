import { z } from 'zod';
import {
  HistoryViewSchema,
  InboxViewSchema,
  ProjectViewSchema,
  TodayViewSchema,
  UpcomingViewSchema
} from '@/contracts/entities';
import { ViewParamsSchema, ViewQuerySchema } from '@/contracts/ontology/views';
import { defineEndpoint } from '@/contracts/types';

const ViewResponseSchema = z.union([
  TodayViewSchema,
  UpcomingViewSchema,
  InboxViewSchema,
  HistoryViewSchema,
  ProjectViewSchema,
  z.object({ ok: z.literal(false), error: z.string() })
]);

export const viewEndpoints = [
  defineEndpoint({
    id: 'views.get',
    method: 'GET',
    path: '/api/views/:name',
    description: 'Fetch named view projection (today/upcoming/inbox/history/project).',
    request: {
      params: ViewParamsSchema,
      query: ViewQuerySchema
    },
    response: {
      kind: 'json',
      success: ViewResponseSchema,
      successStatus: [200, 400]
    },
    metadata: { tags: ['views'] }
  })
] as const;

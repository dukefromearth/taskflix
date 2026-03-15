import { z } from 'zod';
import { SearchResultSchema } from '@/contracts/entities';
import { SearchQuerySchema } from '@/contracts/ontology/search';
import { defineEndpoint } from '@/contracts/types';

export const searchEndpoints = [
  defineEndpoint({
    id: 'search.query',
    method: 'GET',
    path: '/api/search',
    description: 'Search items with optional filters.',
    request: {
      query: SearchQuerySchema
    },
    response: {
      kind: 'json',
      success: z.array(SearchResultSchema),
      successStatus: 200
    },
    metadata: { tags: ['search'] }
  })
] as const;

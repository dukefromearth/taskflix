import { HealthResultSchema } from '@/contracts/entities';
import { defineEndpoint } from '@/contracts/types';

export const healthEndpoints = [
  defineEndpoint({
    id: 'health.get',
    method: 'GET',
    path: '/api/health',
    description: 'Health endpoint for runtime liveness checks.',
    request: {},
    response: {
      kind: 'json',
      success: HealthResultSchema,
      successStatus: 200
    },
    metadata: { tags: ['health'] }
  })
] as const;

import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const getHealthRoute = bindRoute(getEndpoint('health.get'), async () => ({
  data: { ok: true as const }
}));

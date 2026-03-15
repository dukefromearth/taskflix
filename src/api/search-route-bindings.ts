import { getService } from '@/api/service-context';
import { parseSearchFilter } from '@/contracts/ontology/search';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const searchRoute = bindRoute(getEndpoint('search.query'), async ({ query }) => {
  const service = await getService();
  return {
    data: await service.search(query.q ?? '', parseSearchFilter(query))
  };
});

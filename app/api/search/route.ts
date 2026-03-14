import { getService } from '@/api/service-context';
import { SearchQuerySchema, parseSearchFilter } from '@/api/schemas';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseOrThrow(SearchQuerySchema, Object.fromEntries(searchParams.entries()));
    const service = await getService();
    const q = query.q ?? '';
    const filter = parseSearchFilter(query);
    return jsonOk(await service.search(q, filter));
  } catch (error) {
    return handleRouteError(error);
  }
}

import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';
import { parseTimelineStructureQuery, TimelineStructureQuerySchema } from '@/api/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = parseOrThrow(TimelineStructureQuerySchema, Object.fromEntries(searchParams.entries()));
    const input = parseTimelineStructureQuery(raw);
    const service = await getService();
    return jsonOk(await service.getTimelineStructure(input));
  } catch (error) {
    return handleRouteError(error);
  }
}

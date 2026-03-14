import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';
import { parseTimelineQuery, TimelineQuerySchema } from '@/api/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = parseOrThrow(TimelineQuerySchema, Object.fromEntries(searchParams.entries()));
    const input = parseTimelineQuery(raw);
    const service = await getService();
    return jsonOk(await service.getTimelineView(input));
  } catch (error) {
    return handleRouteError(error);
  }
}

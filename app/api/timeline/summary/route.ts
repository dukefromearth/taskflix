import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseOrThrow } from '@/api/next-helpers';
import { parseTimelineSummaryQuery, TimelineSummaryQuerySchema } from '@/api/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = parseOrThrow(TimelineSummaryQuerySchema, Object.fromEntries(searchParams.entries()));
    const input = parseTimelineSummaryQuery(raw);
    const service = await getService();
    return jsonOk(await service.getTimelineSummary(input));
  } catch (error) {
    return handleRouteError(error);
  }
}

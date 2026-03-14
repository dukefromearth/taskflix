import { z } from 'zod';
import type { QueryFilter } from '@/domain/types';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseRequestJson } from '@/api/next-helpers';

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  icon: z.string().trim().min(1).max(64).optional(),
  queryJson: z.record(z.string(), z.unknown())
});

export async function GET() {
  try {
    const service = await getService();
    return jsonOk(await service.listSavedViews());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request, BodySchema);
    const service = await getService();
    return jsonOk(await service.createSavedView(body as { name: string; icon?: string; queryJson: QueryFilter }), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

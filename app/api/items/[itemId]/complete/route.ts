import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getService } from '@/api/service-context';
import { handleRouteError, parseOrThrow, withIdempotency } from '@/api/next-helpers';
import { ok } from '@/api/contracts';

const ParamsSchema = z.object({ itemId: z.string().min(1) });

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const service = await getService();

    const response = await withIdempotency(request, 'item.complete', async () => {
      const item = await service.changeItemStatus(params.itemId, 'done');
      return { status: 200, payload: ok(item) };
    });

    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return handleRouteError(error);
  }
}

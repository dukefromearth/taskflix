import { NextResponse } from 'next/server';
import { getService } from '@/api/service-context';
import { handleRouteError, jsonOk, parseRequestJson, withIdempotency } from '@/api/next-helpers';
import { ItemCreateSchema } from '@/api/schemas';
import { ok } from '@/api/contracts';

export async function GET() {
  try {
    const service = await getService();
    return jsonOk(await service.listItems());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request, ItemCreateSchema);
    const service = await getService();

    const response = await withIdempotency(request, 'item.create', async () => {
      const item = await service.createItem(body);
      return { status: 201, payload: ok(item) };
    });

    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return handleRouteError(error);
  }
}

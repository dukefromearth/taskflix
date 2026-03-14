import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getService } from '@/api/service-context';
import { ProjectCreateSchema } from '@/api/schemas';
import { handleRouteError, jsonOk, parseOrThrow, parseRequestJson, withIdempotency } from '@/api/next-helpers';
import { ok } from '@/api/contracts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseOrThrow(
      z.object({ includeArchived: z.enum(['true', 'false']).optional() }),
      Object.fromEntries(searchParams.entries())
    );

    const service = await getService();
    const projects = await service.listProjects({ includeArchived: query.includeArchived === 'true' });
    return jsonOk(projects);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request, ProjectCreateSchema);
    const service = await getService();

    const response = await withIdempotency(request, 'project.create', async () => {
      const project = await service.createProject(body);
      return { status: 201, payload: ok(project) };
    });

    return NextResponse.json(response.payload, { status: response.status });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError, parseOrThrow } from '@/api/next-helpers';

const ParamsSchema = z.object({ key: z.string().min(1) });

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const params = parseOrThrow(ParamsSchema, await context.params);
    const decodedKey = decodeURIComponent(params.key);
    const normalizedKey = path.normalize(decodedKey).replace(/^\/+/, '');

    if (normalizedKey.startsWith('..') || path.isAbsolute(normalizedKey)) {
      return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid file key' } }, { status: 400 });
    }

    const uploadsDir = process.env.UPLOAD_LOCAL_DIR ?? path.join(process.cwd(), '.uploads');
    const filePath = path.join(uploadsDir, normalizedKey);
    const fileData = await fs.readFile(filePath);

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'cache-control': 'private, max-age=300'
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

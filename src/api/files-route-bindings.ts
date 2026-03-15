import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getEndpoint } from '@/contracts/registry';
import { bindRoute } from '@/contracts/runtime/server';

export const getFileRoute = bindRoute(getEndpoint('files.get'), async ({ params }) => {
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
});

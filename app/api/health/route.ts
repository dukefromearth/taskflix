import { jsonOk } from '@/api/next-helpers';

export async function GET() {
  return jsonOk({ ok: true });
}

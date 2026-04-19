import { jsonResponse } from './_lib/responses';

export async function GET() {
  return jsonResponse({ status: 'ok' });
}

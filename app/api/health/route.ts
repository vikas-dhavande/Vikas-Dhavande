import { jsonResponse } from '../../../api/_lib/responses';

export async function GET() {
  return jsonResponse({ status: 'ok' });
}

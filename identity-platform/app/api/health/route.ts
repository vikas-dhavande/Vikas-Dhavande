import { jsonResponse } from '../../../api/_lib/responses';

export const dynamic = 'force-static';

export async function GET() {
  return jsonResponse({ status: 'ok' });
}

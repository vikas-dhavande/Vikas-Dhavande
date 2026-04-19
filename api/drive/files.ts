import { google } from 'googleapis';
import { jsonResponse } from '../_lib/responses';
import { createOAuthClient, parseStoredTokens } from '../_lib/google-auth';

export async function GET(request: Request) {
  try {
    const tokens = parseStoredTokens(request);
    if (!tokens) {
      return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
    }

    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ auth: oauth2Client, version: 'v3' });
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId')?.replace(/'/g, "\\'") ?? null;
    const query = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false';

    const response = await drive.files.list({
      fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
      q: query,
    });

    return jsonResponse({ files: response.data.files ?? [] });
  } catch (error) {
    console.error('Drive API Error:', error);
    return jsonResponse({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

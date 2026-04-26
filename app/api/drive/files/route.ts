import { google } from 'googleapis';
import { jsonResponse } from '../../../../api/_lib/responses';
import { createOAuthClient, parseStoredTokens } from '../../../../api/_lib/google-auth';

interface DriveListResponse {
  error?: {
    message?: string;
  };
  files?: Array<{
    iconLink?: string | null;
    id?: string | null;
    mimeType?: string | null;
    modifiedTime?: string | null;
    name?: string | null;
    size?: string | null;
    webViewLink?: string | null;
  }>;
}

export async function GET(request: Request) {
  try {
    const tokens = parseStoredTokens(request);
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = new URL(request.url);
    const folderIdRaw = url.searchParams.get('folderId') || process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderId = folderIdRaw?.trim().replace(/['\\]/g, '') || null;

    if (!tokens && !apiKey) {
      return jsonResponse({ error: 'Unauthorized: No tokens or API key provided' }, { status: 401 });
    }

    if (!tokens && !folderId) {
      return jsonResponse(
        { error: 'Missing Google Drive folder id. Set GOOGLE_DRIVE_FOLDER_ID or pass ?folderId=...' },
        { status: 400 },
      );
    }

    const query = folderId ? `'${folderId}' in parents and trashed = false` : 'trashed = false';
    const listOptions = {
      fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
      includeItemsFromAllDrives: true,
      orderBy: 'modifiedTime desc',
      pageSize: 50,
      q: query,
      supportsAllDrives: true,
    } as const;

    type DriveFile = NonNullable<DriveListResponse['files']>[number];
    let files: DriveFile[] = [];

    if (tokens) {
      try {
        const oauth2Client = createOAuthClient();
        oauth2Client.setCredentials(tokens);
        const drive = google.drive({ auth: oauth2Client, version: 'v3' });

        const response = await drive.files.list(listOptions);
        files = response.data.files ?? [];
      } catch (oauthError) {
        console.error('OAuth Drive Fetch Failed, trying API Key fallback:', oauthError);
        if (!apiKey) throw oauthError;
      }
    }

    if (files.length === 0 && apiKey) {
      const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
      driveUrl.searchParams.set('fields', listOptions.fields);
      driveUrl.searchParams.set('includeItemsFromAllDrives', String(listOptions.includeItemsFromAllDrives));
      driveUrl.searchParams.set('key', apiKey);
      driveUrl.searchParams.set('orderBy', listOptions.orderBy);
      driveUrl.searchParams.set('pageSize', String(listOptions.pageSize));
      driveUrl.searchParams.set('q', listOptions.q);
      driveUrl.searchParams.set('supportsAllDrives', String(listOptions.supportsAllDrives));

      const upstreamReferer = request.headers.get('referer') ?? request.headers.get('origin');
      const response = await fetch(driveUrl, {
        headers: upstreamReferer ? { Referer: upstreamReferer } : undefined,
      });
      const data = (await response.json()) as DriveListResponse;

      if (!response.ok) {
        throw new Error(data.error?.message || 'Google Drive API request failed');
      }

      files = data.files ?? [];
    }

    return jsonResponse({ files });
  } catch (error) {
    console.error('Drive API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch files';
    return jsonResponse({ error: message }, { status: 500 });
  }
}

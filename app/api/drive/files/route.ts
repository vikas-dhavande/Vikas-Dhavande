import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DriveFileRaw {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  webViewLink?: string | null;
  iconLink?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Build a GoogleAuth client.
 * Priority:
 *  1. Service Account JSON stored in GOOGLE_SERVICE_ACCOUNT_JSON env var (recommended for Vercel)
 *  2. Individual GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY env vars
 *  3. Fallback to API key for public folders
 */
function buildAuthClient() {
  const jsonCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (jsonCreds) {
    try {
      const creds = JSON.parse(jsonCreds);
      return new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    } catch {
      console.error('[Drive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  }

  if (clientEmail && privateKey) {
    return new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }

  return null; // will fall back to API key path
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const folderIdParam = url.searchParams.get('folderId');
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim().replace(/['"]/g, '');

    // Determine which folder to list
    const folderId = folderIdParam?.trim() || rootFolderId || null;

    const listOptions = {
      fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
      includeItemsFromAllDrives: true,
      orderBy: 'folder,name',         // folders first, then by name
      pageSize: 100,
      q: folderId
        ? `'${folderId}' in parents and trashed = false`
        : 'trashed = false',
      supportsAllDrives: true,
    } as const;

    // ── Path 1: Service Account ──────────────────────────────────────────────
    const authClient = buildAuthClient();

    if (authClient) {
      const drive = google.drive({ auth: authClient, version: 'v3' });
      const response = await drive.files.list(listOptions);
      const files = (response.data.files ?? []) as DriveFileRaw[];
      return json({ files });
    }

    // ── Path 2: API Key (public folders only) ───────────────────────────────
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return json(
        {
          error:
            'Drive not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON (recommended) or GOOGLE_API_KEY in your environment.',
        },
        401,
      );
    }

    if (!folderId) {
      return json(
        {
          error:
            'Set GOOGLE_DRIVE_FOLDER_ID in your environment variables to specify which folder to show.',
        },
        400,
      );
    }

    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    driveUrl.searchParams.set('fields', listOptions.fields);
    driveUrl.searchParams.set('includeItemsFromAllDrives', 'true');
    driveUrl.searchParams.set('key', apiKey);
    driveUrl.searchParams.set('orderBy', listOptions.orderBy);
    driveUrl.searchParams.set('pageSize', String(listOptions.pageSize));
    driveUrl.searchParams.set('q', listOptions.q);
    driveUrl.searchParams.set('supportsAllDrives', 'true');

    const referer =
      request.headers.get('referer') ??
      request.headers.get('origin') ??
      'https://vikas-dhavande.vercel.app';

    const res = await fetch(driveUrl.toString(), {
      headers: { Referer: referer },
    });

    const data = (await res.json()) as { files?: DriveFileRaw[]; error?: { message?: string } };

    if (!res.ok) {
      const msg = data.error?.message ?? `Google API returned ${res.status}`;
      console.error('[Drive] API key fetch failed:', msg);
      throw new Error(msg);
    }

    return json({ files: data.files ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Drive files';
    console.error('[Drive] Error:', message);
    return json({ error: message }, 500);
  }
}

import { NextResponse } from 'next/server';
import {
  DEFAULT_RESOURCES_BUCKET,
  getStorageFileUrls,
  listAppwriteFiles,
  uploadAppwriteBuffer,
  deleteAppwriteStorageFile,
} from '@/lib/appwrite-storage';
import { createSessionClient } from '@/lib/appwrite-server';

export const runtime = 'nodejs';

function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const cookieName = projectId ? `a_session_${projectId}` : '';
  const legacyCookieName = projectId ? `a_session_${projectId}_legacy` : '';

  const items = cookieHeader.split(';').map((c) => c.trim());
  for (const item of items) {
    const [name, ...val] = item.split('=');
    if (name === cookieName || name === legacyCookieName || name === 'appwrite-session') {
      return decodeURIComponent(val.join('='));
    }
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bucketId = url.searchParams.get('bucketId') || DEFAULT_RESOURCES_BUCKET;
    const search = url.searchParams.get('search') || undefined;

    const result = await listAppwriteFiles(bucketId, search);

    const files = result.files.map((file) => {
      const { viewUrl, downloadUrl } = getStorageFileUrls(file.$id, bucketId);
      return {
        id: file.$id,
        name: file.name,
        mimeType: file.mimeType,
        size: String(file.sizeOriginal),
        modifiedTime: file.$updatedAt || file.$createdAt,
        createdTime: file.$createdAt,
        viewUrl,
        downloadUrl,
        // Compatibility with legacy callers
        webViewLink: viewUrl,
        iconLink: '',
        bucketId: file.bucketId,
      };
    });

    return NextResponse.json({
      total: result.total,
      bucketId,
      files,
    });
  } catch (error: any) {
    console.error('[Appwrite Storage] Error listing files:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list storage files' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Sign in required to upload' }, { status: 401 });
    }

    try {
      const { account } = createSessionClient(token);
      await account.get();
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucketId = (formData.get('bucketId') as string) || DEFAULT_RESOURCES_BUCKET;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await uploadAppwriteBuffer(buffer, file.name, bucketId);
    const { viewUrl, downloadUrl } = getStorageFileUrls(uploaded.$id, bucketId);

    return NextResponse.json(
      {
        file: {
          id: uploaded.$id,
          name: uploaded.name,
          mimeType: uploaded.mimeType,
          size: String(uploaded.sizeOriginal),
          modifiedTime: uploaded.$updatedAt || uploaded.$createdAt,
          viewUrl,
          downloadUrl,
          bucketId: uploaded.bucketId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Appwrite Storage] Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file to Appwrite storage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Sign in required to delete' }, { status: 401 });
    }

    try {
      const { account } = createSessionClient(token);
      await account.get();
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    }

    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');
    const bucketId = url.searchParams.get('bucketId') || DEFAULT_RESOURCES_BUCKET;

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    await deleteAppwriteStorageFile(fileId, bucketId);
    return NextResponse.json({ success: true, message: `File ${fileId} deleted` });
  } catch (error: any) {
    console.error('[Appwrite Storage] Delete error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete file from Appwrite storage' },
      { status: 500 }
    );
  }
}

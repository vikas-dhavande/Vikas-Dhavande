import { NextResponse } from 'next/server';
import {
  DEFAULT_RESOURCES_BUCKET,
  getStorageFileUrls,
  listAppwriteFiles,
} from '@/lib/appwrite-storage';

export const runtime = 'nodejs';

/**
 * Compatibility handler for legacy /api/drive/files route.
 * Redirects requests to Appwrite Storage resources bucket.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    const bucketId = DEFAULT_RESOURCES_BUCKET;

    const result = await listAppwriteFiles(bucketId, search);

    const files = result.files.map((file) => {
      const { viewUrl, downloadUrl } = getStorageFileUrls(file.$id, bucketId);
      return {
        id: file.$id,
        name: file.name,
        mimeType: file.mimeType,
        size: String(file.sizeOriginal),
        modifiedTime: file.$updatedAt || file.$createdAt,
        webViewLink: viewUrl,
        downloadUrl,
        iconLink: '',
      };
    });

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error('[Drive Compatibility Route] Appwrite fallback error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to list Appwrite storage files' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getAppwriteStorage } from '@/lib/appwrite-storage';

/**
 * POST /api/storage/presigned-url
 * Creates a file metadata token or upload destination using Appwrite Storage.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename, bucketName } = body as {
    filename?: string;
    contentType?: string;
    bucketName?: string;
  };

  const missingFields: string[] = [];
  if (!filename) missingFields.push('filename');
  if (!bucketName) missingFields.push('bucketName');

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const { ID } = getAppwriteStorage();
    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    // Appwrite files upload endpoint
    const uploadUrl = `${endpoint}/storage/buckets/${bucketName}/files`;

    return NextResponse.json({
      uploadUrl,
      bucketId: bucketName,
      fileId: ID.unique(),
      projectId,
    });
  } catch (initError: unknown) {
    const message = initError instanceof Error ? initError.message : String(initError);
    console.error('Appwrite Storage initialisation error:', message);
    return NextResponse.json(
      { error: 'Storage service is not configured correctly' },
      { status: 500 }
    );
  }
}

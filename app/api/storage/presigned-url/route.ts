import { NextResponse } from 'next/server';
import { getS3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * POST /api/storage/presigned-url
 * Generates a pre-signed URL for a direct S3 PutObject upload.
 * The URL expires in 60 seconds.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename, contentType, bucketName } = body as {
    filename?: string;
    contentType?: string;
    bucketName?: string;
  };

  // Validate required fields and list which ones are missing (Req 5.2)
  const missingFields: string[] = [];
  if (!filename) missingFields.push('filename');
  if (!contentType) missingFields.push('contentType');
  if (!bucketName) missingFields.push('bucketName');

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 }
    );
  }

  // Initialise S3 client — catch credential/config errors (Req 5.5)
  let s3Client;
  try {
    s3Client = getS3Client();
  } catch (initError: unknown) {
    const message = initError instanceof Error ? initError.message : String(initError);
    console.error('S3 client initialisation error:', message);
    return NextResponse.json(
      { error: 'Storage service is not configured correctly' },
      { status: 500 }
    );
  }

  try {
    // Create the PutObject command (Req 5.1, 5.3, 5.4)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      ContentType: contentType,
    });

    // Generate a pre-signed URL that expires in 60 seconds (Req 5.1)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ signedUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error generating signed URL:', message);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}

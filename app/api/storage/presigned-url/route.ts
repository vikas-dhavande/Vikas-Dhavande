import { NextResponse } from 'next/server';
import { getS3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Example API route to generate a pre-signed URL for S3 upload
 * This allows the client to upload files directly to Supabase S3.
 */
export async function POST(request: Request) {
  try {
    const { filename, contentType, bucketName } = await request.json();

    if (!filename || !contentType || !bucketName) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType, bucketName' },
        { status: 400 }
      );
    }

    const s3Client = getS3Client();
    
    // Create the command for uploading an object
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      ContentType: contentType,
    });

    // Generate a pre-signed URL that expires in 60 seconds
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ signedUrl });
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

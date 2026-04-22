import { NextResponse } from 'next/server';
import { getS3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Example API route to generate a pre-signed URL for S3 upload
 * This allows the client to upload files directly to Supabase S3.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is admin
    const { isAdmin } = await import('@/lib/auth-utils');
    const isUserAdmin = await isAdmin(supabase, user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

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

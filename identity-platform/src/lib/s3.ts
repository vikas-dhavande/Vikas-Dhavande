import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;
const region = process.env.SUPABASE_S3_REGION || "ap-south-1";
const endpoint = process.env.SUPABASE_S3_ENDPOINT;

if (!accessKeyId || !secretAccessKey || !endpoint) {
  if (typeof window === "undefined") {
    console.warn("Missing Supabase S3 environment variables.");
  }
}

let s3Client: S3Client | null = null;

/**
 * Get a configured S3 client for Supabase Storage.
 * Note: This should ideally be used on the server side as it requires secret keys.
 */
export function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
      // Supabase S3 is compatible but might require forcePathStyle depending on the bucket structure
      forcePathStyle: true,
    });
  }
  return s3Client;
}

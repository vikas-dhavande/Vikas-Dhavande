import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Feature: cms-architecture, Property 13

// Mock the S3 module so tests don't need real AWS credentials
vi.mock('@/lib/s3', () => ({
  getS3Client: vi.fn(() => ({})),
}));

// Mock the AWS SDK presigner so we don't make real network calls
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(() => Promise.resolve('https://example.com/signed-url')),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  // PutObjectCommand is used with `new`, so mock it as a class
  PutObjectCommand: class PutObjectCommand {
    constructor(public input: unknown) {}
  },
  S3Client: vi.fn(),
}));

// Helper to build a Request with a JSON body
function buildRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/storage/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Property 13: Presigned URL request missing fields returns 400', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for any combination of missing required fields', async () => {
    // **Validates: Requirements 5.2**
    const { POST } = await import('../../app/api/storage/presigned-url/route');

    await fc.assert(
      fc.asyncProperty(
        // Generate a non-empty subset of fields to omit
        fc.subarray(['filename', 'contentType', 'bucketName'] as const, { minLength: 1 }),
        async (missingFields) => {
          const allFields: Record<string, string> = {
            filename: 'test-image.png',
            contentType: 'image/png',
            bucketName: 'my-bucket',
          };

          // Remove the missing fields from the request body
          const body: Record<string, string> = { ...allFields };
          for (const field of missingFields) {
            delete body[field];
          }

          const request = buildRequest(body);
          const response = await POST(request);

          return response.status === 400;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('lists the missing fields in the 400 error message', async () => {
    // **Validates: Requirements 5.2**
    const { POST } = await import('../../app/api/storage/presigned-url/route');

    await fc.assert(
      fc.asyncProperty(
        fc.subarray(['filename', 'contentType', 'bucketName'] as const, { minLength: 1 }),
        async (missingFields) => {
          const allFields: Record<string, string> = {
            filename: 'test-image.png',
            contentType: 'image/png',
            bucketName: 'my-bucket',
          };

          const body: Record<string, string> = { ...allFields };
          for (const field of missingFields) {
            delete body[field];
          }

          const request = buildRequest(body);
          const response = await POST(request);
          const json = await response.json();

          // The error message must mention each missing field
          return missingFields.every((field) =>
            typeof json.error === 'string' && json.error.includes(field)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 200 with a signedUrl when all fields are present', async () => {
    // Sanity check: valid request succeeds
    const { POST } = await import('../../app/api/storage/presigned-url/route');

    const request = buildRequest({
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
      bucketName: 'media',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('signedUrl');
  });

  it('returns 500 without credential values when S3 client init fails', async () => {
    // **Validates: Requirements 5.5**
    const { getS3Client } = await import('@/lib/s3');
    vi.mocked(getS3Client).mockImplementationOnce(() => {
      throw new Error(
        'Missing credentials: accessKeyId=secret123 secretAccessKey=topsecret'
      );
    });

    const { POST } = await import('../../app/api/storage/presigned-url/route');

    const request = buildRequest({
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
      bucketName: 'media',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    // Must not expose credential values in the response
    expect(json.error).not.toContain('secret123');
    expect(json.error).not.toContain('topsecret');
    expect(json.error).not.toContain('accessKeyId');
    expect(json.error).not.toContain('secretAccessKey');
  });
});

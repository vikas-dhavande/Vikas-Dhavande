import { Client, Storage, ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

export const DEFAULT_RESOURCES_BUCKET =
  process.env.APPWRITE_RESOURCES_BUCKET_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_BUCKET_ID ||
  'resources';

export function getAppwriteStorage() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId) {
    throw new Error('Appwrite Storage: missing endpoint or project ID');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);
  if (apiKey) {
    client.setKey(apiKey);
  }

  const storage = new Storage(client);

  return {
    storage,
    client,
    ID,
    endpoint,
    projectId,
  };
}

export function getStorageFileUrls(fileId: string, bucketId: string = DEFAULT_RESOURCES_BUCKET) {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6ad0f8ab0025a03812f7';

  const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;

  return {
    viewUrl,
    downloadUrl,
  };
}

export async function listAppwriteFiles(bucketId: string = DEFAULT_RESOURCES_BUCKET, search?: string) {
  const { storage } = getAppwriteStorage();
  const queries: string[] = [];
  return await storage.listFiles(bucketId, queries, search);
}

export async function uploadAppwriteBuffer(
  buffer: Buffer,
  filename: string,
  bucketId: string = DEFAULT_RESOURCES_BUCKET,
  fileId: string = ID.unique()
) {
  const { storage } = getAppwriteStorage();
  const inputFile = InputFile.fromBuffer(buffer, filename);
  return await storage.createFile(bucketId, fileId, inputFile);
}

export async function deleteAppwriteStorageFile(
  fileId: string,
  bucketId: string = DEFAULT_RESOURCES_BUCKET
) {
  const { storage } = getAppwriteStorage();
  return await storage.deleteFile(bucketId, fileId);
}

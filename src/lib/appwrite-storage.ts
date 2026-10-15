import { Client, Storage, ID } from 'node-appwrite';

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
  };
}

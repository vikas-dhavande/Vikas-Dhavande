import { Client, Account, Users, Storage } from 'node-appwrite';

export function createAdminClient() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId) {
    throw new Error('Appwrite endpoint and project ID must be defined');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);

  if (apiKey) {
    client.setKey(apiKey);
  }

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

export function createSessionClient(sessionToken: string) {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error('Appwrite endpoint and project ID must be defined');
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(sessionToken);

  return {
    get account() {
      return new Account(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
}

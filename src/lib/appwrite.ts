import { Client } from 'appwrite';

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  process.env.APPWRITE_ENDPOINT ||
  'https://sfo.cloud.appwrite.io/v1';

const projectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  process.env.APPWRITE_PROJECT_ID ||
  '6ad0f8ab0025a03812f7';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export { client };

import { Blog } from '../types';
import { Client, Databases, Query, ID } from 'node-appwrite';

function getDatabases() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId) {
    return null;
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);
  if (apiKey) {
    client.setKey(apiKey);
  }

  return new Databases(client);
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
const COLLECTION_ID = process.env.APPWRITE_BLOGS_COLLECTION_ID || 'blogs';

export async function getBlogs() {
  try {
    const databases = getDatabases();
    if (!databases) return [];

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.isNotNull('published_at'),
      Query.lessThanEqual('published_at', new Date().toISOString()),
      Query.orderDesc('published_at'),
    ]);

    return response.documents as unknown as Blog[];
  } catch (error) {
    console.error('Error fetching blogs from Appwrite:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const databases = getDatabases();
    if (!databases) return null;

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('slug', slug),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) return null;
    return response.documents[0] as unknown as Blog;
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug} from Appwrite:`, error);
    return null;
  }
}

export async function createBlog(blog: Partial<Blog>) {
  const databases = getDatabases();
  if (!databases) {
    throw new Error('Appwrite Databases service is not configured.');
  }

  const document = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    blog
  );

  return document as unknown as Blog;
}

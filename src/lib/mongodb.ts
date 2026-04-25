import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase(): Promise<MongoClient | null> {
  if (cachedClient) return cachedClient;

  if (!cachedPromise) {
    cachedPromise = MongoClient.connect(process.env.MONGODB_URI!);
  }

  try {
    cachedClient = await cachedPromise;
    return cachedClient;
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error);
    cachedPromise = null;
    return null;
  }
}

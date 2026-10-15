import { NextRequest, NextResponse } from 'next/server';
import { normaliseRange, aggregateEvents } from '@/lib/analytics-utils';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
const COLLECTION_ID = process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics_events';

export async function GET(req: NextRequest) {
  try {
    const rawRange = req.nextUrl.searchParams.get('range');
    const { startDate } = normaliseRange(rawRange);

    const { account } = createAdminClient();
    // Using admin client node-appwrite Databases service
    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      return NextResponse.json({ error: 'Appwrite is not configured' }, { status: 503 });
    }

    const { Client, Databases } = await import('node-appwrite');
    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const databases = new Databases(client);

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.greaterThanEqual('$createdAt', startDate.toISOString()),
    ]);

    const events = response.documents.map((doc: any) => ({
      path: doc.path,
      session_id: doc.session_id,
      created_at: doc.$createdAt,
    }));

    const stats = aggregateEvents(events);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

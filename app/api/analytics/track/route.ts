import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
const COLLECTION_ID = process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics_events';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, path, session_id, user_agent, referrer, metadata } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!event_name) missing.push('event_name');
    if (!path) missing.push('path');
    if (!session_id) missing.push('session_id');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
      return NextResponse.json({ error: 'Appwrite is not configured' }, { status: 503 });
    }

    const { Client, Databases } = await import('node-appwrite');
    const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
    const databases = new Databases(client);

    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        event_name,
        path,
        session_id,
        user_agent: user_agent || '',
        referrer: referrer || '',
        metadata: JSON.stringify(metadata || {}),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ANALYTICS_TRACK_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'default';
const COLLECTION_ID = process.env.APPWRITE_BLOGS_COLLECTION_ID || 'blogs';

function getDatabases() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    return null;
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  return new Databases(client);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const databases = getDatabases();
    if (!databases) {
      return NextResponse.json({ error: 'Appwrite is not configured' }, { status: 503 });
    }

    const blog = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      {
        ...body,
        updated_at: new Date().toISOString(),
      }
    );

    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const databases = getDatabases();
    if (!databases) {
      return NextResponse.json({ error: 'Appwrite is not configured' }, { status: 503 });
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

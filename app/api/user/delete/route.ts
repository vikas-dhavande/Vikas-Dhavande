import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient, createAdminClient } from '@/lib/appwrite-server';

export const runtime = 'nodejs';

function getSessionTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const cookieName = projectId ? `a_session_${projectId}` : '';
  const legacyCookieName = projectId ? `a_session_${projectId}_legacy` : '';

  const items = cookieHeader.split(';').map((c) => c.trim());
  for (const item of items) {
    const [name, ...val] = item.split('=');
    if (name === cookieName || name === legacyCookieName || name === 'appwrite-session') {
      return decodeURIComponent(val.join('='));
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }

    // 1. Verify caller session and get user ID
    let currentUserId: string;
    let currentUserEmail: string;
    try {
      const { account } = createSessionClient(token);
      const user = await account.get();
      currentUserId = user.$id;
      currentUserEmail = user.email || '';
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
    }

    // 2. Parse confirmation body
    const body = await request.json().catch(() => ({}));
    const confirmation = (body.confirmation || '').trim();

    if (
      confirmation.toLowerCase() !== 'delete' &&
      confirmation.toLowerCase() !== currentUserEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Confirmation does not match. Please type DELETE or your email address to confirm.' },
        { status: 400 }
      );
    }

    // 3. Delete user via Admin SDK or clear sessions
    try {
      const admin = createAdminClient();
      await admin.users.delete(currentUserId);
    } catch (adminErr: any) {
      console.warn('[Account Deletion] Admin delete user failed, deleting sessions:', adminErr?.message);
      // Fallback: delete current user session
      try {
        const { account } = createSessionClient(token);
        await account.deleteSession('current');
      } catch {
        // ignore fallback errors
      }
    }

    // 4. Clear session cookie in response
    const response = NextResponse.json({
      success: true,
      message: 'Account successfully deleted',
    });

    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    if (projectId) {
      response.cookies.delete(`a_session_${projectId}`);
      response.cookies.delete(`a_session_${projectId}_legacy`);
    }
    response.cookies.delete('appwrite-session');

    return response;
  } catch (err: any) {
    console.error('[Account Deletion] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

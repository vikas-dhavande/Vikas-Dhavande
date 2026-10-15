import { NextResponse, type NextRequest } from 'next/server';
import { createSessionClient } from '@/lib/appwrite-server';

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const isDashboard = pathname.startsWith('/dashboard');

    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    
    // Check for Appwrite session cookie (Appwrite client sets a cookie named 'a_session_<projectId>' or 'a_session_<projectId>_legacy')
    const sessionCookieName = projectId ? `a_session_${projectId}` : undefined;
    const sessionCookie = sessionCookieName 
      ? request.cookies.get(sessionCookieName)?.value 
      : undefined;

    // Fallback: check generic custom appwrite-session header or cookie if present
    const sessionToken = sessionCookie || request.cookies.get('appwrite-session')?.value;

    if (!sessionToken) {
      const rawIp = request.headers.get('x-forwarded-for') ?? 'unknown';
      const ip = rawIp.split(',')[0].trim();

      console.warn('[SECURITY] Unauthenticated access attempt', {
        path: pathname,
        ip,
      });

      const loginUrl = new URL('/sign-in', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticate session with Appwrite
    let user;
    try {
      const { account } = createSessionClient(sessionToken);
      user = await account.get();
    } catch (authErr) {
      console.warn('[SECURITY] Invalid session token', authErr);
      const loginUrl = new URL('/sign-in', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // /profile and /resources — any authenticated user is allowed
    if (!isDashboard) {
      return NextResponse.next();
    }

    // /dashboard — requires admin or super_user label
    const userLabels = user.labels || [];
    const isAdmin = userLabels.includes('admin') || userLabels.includes('super_user');

    if (!isAdmin) {
      const rawIp = request.headers.get('x-forwarded-for') ?? 'unknown';
      const ip = rawIp.split(',')[0].trim();

      console.warn('[SECURITY] Unauthorised dashboard access (insufficient role/label)', {
        path: pathname,
        labels: userLabels,
        ip,
      });

      return NextResponse.redirect(new URL('/', request.url));
    }

    console.info('[INFO] Authenticated admin request', {
      path: pathname,
      userId: user.$id,
      labels: userLabels,
    });

    return NextResponse.next();
  } catch (err) {
    console.error('[Middleware] Unexpected error, falling through:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/resources/:path*', '/profile/:path*'],
};

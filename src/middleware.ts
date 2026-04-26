import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_DD_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_DD_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next();
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Anonymise IP: take only the first address if comma-separated
      const rawIp = request.headers.get('x-forwarded-for') ?? 'unknown';
      const ip = rawIp.split(',')[0].trim();

      console.warn('[SECURITY] Unauthenticated access attempt', {
        path: request.nextUrl.pathname,
        ip,
      });

      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('login', 'true');
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session present — check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin =
      profile?.role === 'admin' || profile?.role === 'super_user';

    if (!isAdmin) {
      const rawIp = request.headers.get('x-forwarded-for') ?? 'unknown';
      const ip = rawIp.split(',')[0].trim();

      console.warn('[SECURITY] Unauthorised access attempt (insufficient role)', {
        path: request.nextUrl.pathname,
        role: profile?.role ?? null,
        ip,
      });

      return NextResponse.redirect(new URL('/', request.url));
    }

    console.info('[INFO] Authenticated request', {
      path: request.nextUrl.pathname,
      userId: user.id,
      role: profile?.role,
    });

    // Authorised — forward with refreshed cookie headers
    return response;
  } catch (err) {
    console.error('[Middleware] Unexpected error, falling through:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/resources/:path*'],
};

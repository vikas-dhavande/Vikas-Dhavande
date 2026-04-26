import { NextResponse } from 'next/server';
import { createClient } from '../../../src/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL after successful sign in
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      console.error('[AUTH CALLBACK] Supabase client could not be initialized');
      return NextResponse.redirect(new URL('/auth/auth-error', request.url));
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.info('[AUTH CALLBACK] Successfully exchanged code for session');
      return NextResponse.redirect(new URL(next, request.url));
    }

    console.error('[AUTH CALLBACK] Error exchanging code for session:', error.message);
  } else {
    console.warn('[AUTH CALLBACK] No code provided in callback');
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-error', request.url));
}

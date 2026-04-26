import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function isSupabaseServerConfigured() {
  const url = process.env.NEXT_PUBLIC_DD_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_DD_SUPABASE_ANON_KEY;

  return Boolean(url && key);
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_DD_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_DD_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  });
}

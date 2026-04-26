import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// For backward compatibility with existing code
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  if (!url || !key) return null;

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, key);
  }
  return supabaseClient;
}

// New helper for client components (specifically for Next.js)
export function createClient() {
  const url = supabaseUrl;
  const key = supabaseAnonKey;
  if (!url || !key) return null;

  return createBrowserClient(url, key);
}

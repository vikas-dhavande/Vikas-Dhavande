import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// For backward compatibility with existing code
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// New helper for client components (specifically for Next.js)
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

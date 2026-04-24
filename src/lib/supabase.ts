import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// For backward compatibility with existing code
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a no-op proxy during build/SSR when env vars are not available.
    // The real client is only needed in the browser.
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as any;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// New helper for client components (specifically for Next.js)
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return getSupabase() as any;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

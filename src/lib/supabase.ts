import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only throw in browser environment to avoid build issues if envs are missing
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables.');
  }
}

// For backward compatibility with existing code
let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return supabaseClient;
}

// New helper for client components (specifically for Next.js)
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

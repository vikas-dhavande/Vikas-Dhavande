import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
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

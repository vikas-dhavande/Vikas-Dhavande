import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if a user has admin or super_user privileges
 * @param supabase Supabase client instance
 * @param userId UUID of the user to check
 * @returns boolean indicating if the user is an admin
 */
export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return profile.role === 'admin' || profile.role === 'super_user';
  } catch (error) {
    console.error('[AUTH_UTILS] Error checking admin status:', error);
    return false;
  }
}

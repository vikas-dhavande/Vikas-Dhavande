'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, User } from '../types';
import { getSupabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export type OAuthProvider = 'google' | 'github' | 'facebook' | 'azure';

interface AuthContextType extends AuthState {
  login: () => void;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const supabase = getSupabase();

  const mapSupabaseUser = (sbUser: any): Omit<User, 'role'> | null => {
    if (!sbUser) return null;
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
      picture: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '',
    };
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          logger.error('Error fetching user profile', { error: profileError });
        }

        setAuthState({
          isAuthenticated: true,
          user: {
            ...mapSupabaseUser(session.user)!,
            role: profile?.role || 'user',
          },
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      logger.error('Error checking auth session', { error });
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    }
  };

  useEffect(() => {
    // Initial check
    void checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          logger.info('User signed in', { userId: session.user.id, provider: session.user.app_metadata.provider });
        }
        
        // Fetch profile with role on change
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setAuthState({
          isAuthenticated: true,
          user: {
            ...mapSupabaseUser(session.user)!,
            role: profile?.role || 'user',
          },
          loading: false,
        });
      } else {
        if (event === 'SIGNED_OUT') {
          logger.info('User signed out');
        }
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    } catch (error) {
      logger.error('Error signing out', { error });
    }
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    logger.info('Initiating OAuth login', { provider });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      logger.error('Error during OAuth login', { provider, error: error.message });
    }
  };

  const signInWithGoogle = () => signInWithProvider('google');
  const signInWithGithub = () => signInWithProvider('github');

  return (
    <AuthContext.Provider value={{ ...authState, login: () => {}, signInWithProvider, signInWithGoogle, signInWithGithub, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

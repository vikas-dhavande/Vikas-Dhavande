'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, User } from '../types';
import { getSupabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: () => void; // This will now typically open the modal, but we'll keep the signature
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

  const mapSupabaseUser = (sbUser: any): User | null => {
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
        setAuthState({
          isAuthenticated: true,
          user: mapSupabaseUser(session.user),
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
      console.error('Error checking auth session:', error);
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    }
  };

  useEffect(() => {
    // Initial check
    void checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          isAuthenticated: true,
          user: mapSupabaseUser(session.user),
          loading: false,
        });
      } else {
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

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // For Google Drive integration, you might need extra scopes
        // scopes: 'https://www.googleapis.com/auth/drive.readonly'
      }
    });
    if (error) console.error('Error signing in with Google:', error.message);
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) console.error('Error signing in with Github:', error.message);
  };

  const login = () => {
    // This function can be used to trigger the modal if we pass a state down
    // For now, we'll implement the actual logic in the modal component
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signInWithGoogle, signInWithGithub, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

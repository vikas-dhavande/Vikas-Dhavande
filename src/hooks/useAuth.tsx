'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, User } from '../types';
import { client } from '../lib/appwrite';
import { Account, OAuthProvider as AppwriteOAuthProvider } from 'appwrite';
import { logger } from '../lib/logger';
import { toast } from 'sonner';

export type OAuthProvider = 'google' | 'github';

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

  const checkAuth = async () => {
    try {
      const account = new Account(client);
      const appwriteUser = await account.get();

      if (!appwriteUser) {
        setAuthState({ isAuthenticated: false, user: null, loading: false });
        return;
      }

      const labels = appwriteUser.labels || [];
      const role = labels.includes('admin') || labels.includes('super_user')
        ? (labels.includes('super_user') ? 'super_user' : 'admin')
        : 'user';

      const userPrefs = appwriteUser.prefs || {};
      const user: User = {
        id: appwriteUser.$id,
        email: appwriteUser.email || '',
        name: appwriteUser.name || appwriteUser.email?.split('@')[0] || 'User',
        picture: userPrefs.avatarUrl || '',
        role,
        emailVerification: Boolean(appwriteUser.emailVerification),
        createdAt: appwriteUser.$createdAt,
        phone: appwriteUser.phone || '',
        prefs: userPrefs,
      };

      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });
    } catch {
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const logout = async () => {
    try {
      const account = new Account(client);
      await account.deleteSession({ sessionId: 'current' });
      setAuthState({ isAuthenticated: false, user: null, loading: false });
    } catch (error) {
      logger.error('Error signing out', { error });
    }
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    logger.info('Initiating OAuth login', { provider });
    const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
    try {
      const account = new Account(client);
      const targetProvider = provider === 'google' 
        ? AppwriteOAuthProvider.Google 
        : AppwriteOAuthProvider.Github;

      account.createOAuth2Session({
        provider: targetProvider,
        success: `${window.location.origin}/`,
        failure: `${window.location.origin}/sign-in`,
      });
    } catch (err) {
      logger.error('Unexpected error during OAuth login', { provider, error: err });
      toast.error(`Failed to sign in with ${providerLabel}`, {
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const signInWithGoogle = () => signInWithProvider('google');
  const signInWithGithub = () => signInWithProvider('github');

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: () => {},
        signInWithProvider,
        signInWithGoogle,
        signInWithGithub,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

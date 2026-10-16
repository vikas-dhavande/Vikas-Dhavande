'use client';

import * as React from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  defaultTab: 'sign-in' | 'sign-up';
  redirectTo: string;
  openAuthModal: (tab?: 'sign-in' | 'sign-up', redirect?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = React.createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [defaultTab, setDefaultTab] = React.useState<'sign-in' | 'sign-up'>('sign-in');
  const [redirectTo, setRedirectTo] = React.useState('/');

  const openAuthModal = React.useCallback(
    (tab: 'sign-in' | 'sign-up' = 'sign-in', redirect: string = '/') => {
      setDefaultTab(tab);
      setRedirectTo(redirect);
      setIsOpen(true);
    },
    []
  );

  const closeAuthModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        defaultTab,
        redirectTo,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextType {
  const context = React.useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

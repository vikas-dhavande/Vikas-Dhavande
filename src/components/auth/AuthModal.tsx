'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';
import AuthCard from './AuthCard';

export function AuthModal() {
  const { isOpen, defaultTab, redirectTo, closeAuthModal } = useAuthModal();
  const { checkAuth } = useAuth();

  const handleSuccess = async () => {
    closeAuthModal();
    await checkAuth();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md sm:max-w-md overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{defaultTab === 'sign-in' ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>Access your developer account and cloud resources</DialogDescription>
        </DialogHeader>
        <AuthCard
          defaultTab={defaultTab}
          isModal={true}
          onSuccess={handleSuccess}
          customRedirect={redirectTo}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;

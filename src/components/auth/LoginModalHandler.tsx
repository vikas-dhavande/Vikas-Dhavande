'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface LoginModalHandlerProps {
  onOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export function LoginModalHandler({ onOpen, isAuthenticated, loading }: LoginModalHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('login') === 'true' && !isAuthenticated && !loading) {
      onOpen(true);
    }
  }, [searchParams, isAuthenticated, loading, onOpen]);

  return null;
}

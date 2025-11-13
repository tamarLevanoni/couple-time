'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { SessionManager } from '@/components/auth/session-manager';
import { SessionDebug } from '@/components/debug/session-debug';
import { AuthPopupContainer } from '@/components/auth/auth-popup-container';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <SessionManager />
      {/* <SessionDebug /> */}
      {children}
      <AuthPopupContainer />
      <Toaster position="top-center" richColors />
    </SessionProvider>
  );
}
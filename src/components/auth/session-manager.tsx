'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

export function SessionManager() {
  const { data: session, status } = useSession();
  const { setAuthenticated, setLoading, openAuthPopup } = useAuthStore();


  // Sync NextAuth session with Zustand auth store
  useEffect(() => {
    setLoading(status === 'loading');
    setAuthenticated(status === 'authenticated');
  }, [status, setAuthenticated, setLoading]);

  useEffect(() => {
    if (session?.user?.needsProfileCompletion) {
      openAuthPopup('complete-profile');
    } else if (session && status === 'authenticated') {
      // If user just logged in (including Google OAuth), close any open auth popup
      const { showAuthPopup, closeAuthPopup } = useAuthStore.getState();
      if (showAuthPopup) {
        closeAuthPopup();
      }
    }
  }, [session, status, openAuthPopup]);

  // Debug session data
  useEffect(() => {
    if (session) {
      console.log('🔍 SessionManager - session data:', {
        status,
        userId: session.user?.id,
        email: session.user?.email,
        needsProfileCompletion: session.user?.needsProfileCompletion,
        googleId: session.user?.googleId,
        hasRoles: !!session.user?.roles?.length
      });
    }
  }, [session, status]);

  return null;
}
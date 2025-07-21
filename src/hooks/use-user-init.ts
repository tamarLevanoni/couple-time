'use client';

import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store/user-store';
import { useEffect } from 'react';

// Simple hook to initialize user data when authenticated
export function useUserInit() {
  const { data: session, status } = useSession();
  const { user, isLoading, loadUserData, clearUser } = useUserStore();
  
  // Only fetch user data if user is authenticated
  const shouldFetch = status === 'authenticated' && session?.user?.id;
  
  useEffect(() => {
    if (shouldFetch && !user && !isLoading) {
      loadUserData();
    } else if (!shouldFetch) {
      clearUser();
    }
  }, [shouldFetch, user, isLoading, loadUserData, clearUser]);
}
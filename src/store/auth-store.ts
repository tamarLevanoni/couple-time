'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { signOut } from 'next-auth/react';
import { useUserStore } from './user-store';
import { CompleteGoogleProfileInput } from '@/lib/validations';

type AuthPopupMode = 'login' | 'signup' | 'complete-profile' | null;

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsProfileCompletion: boolean;
  showAuthPopup: boolean;
  authPopupMode: AuthPopupMode;
}

interface AuthActions {
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  setNeedsProfileCompletion: (v: boolean) => void;
  completeProfile: (data: { name: string; phone: string }) => Promise<void>;
  openAuthPopup: (mode: AuthPopupMode) => void;
  closeAuthPopup: () => void;
  setAuthPopupMode: (mode: AuthPopupMode) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needsProfileCompletion: false,
      showAuthPopup: false,
      authPopupMode: null,

      // Actions
      setAuthenticated: (isAuthenticated) =>
        set({ isAuthenticated }, false, 'setAuthenticated'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      setNeedsProfileCompletion: (v) => set({ needsProfileCompletion: v }),

      completeProfile: async ({ name, phone }) => {
        const res = await fetch('/api/auth/complete-google-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        });
    
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error);
        }
    
        set({ needsProfileCompletion: false });
      },

      logout: async () => {
        set({ isLoading: true }, false, 'logout/start');
        
        try {
          // Clear user store first
          useUserStore.getState().clearUser();
          
          // Sign out from NextAuth
          await signOut({ redirect: false });
          
          set({ 
            isAuthenticated: false, 
            error: null,
            isLoading: false 
          }, false, 'logout/success');
        } catch (error) {
          console.error('Logout failed:', error);
          set({ 
            error: 'שגיאה בהתנתקות',
            isLoading: false 
          }, false, 'logout/error');
        }
      },

      openAuthPopup: (mode) => 
        set({ showAuthPopup: true, authPopupMode: mode, error: null }, false, 'openAuthPopup'),

      closeAuthPopup: () => 
        set({ showAuthPopup: false, authPopupMode: null, error: null }, false, 'closeAuthPopup'),

      setAuthPopupMode: (mode) => 
        set({ authPopupMode: mode, error: null }, false, 'setAuthPopupMode'),
    }),
    { name: 'auth-store' }
  )
);


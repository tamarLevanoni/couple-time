'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AdminStatsState {
  systemStats: any | null;
  isLoading: boolean;
  error: string | null;
}

interface AdminStatsActions {
  loadSystemStats: () => Promise<void>;
  setError: (error: string | null) => void;
}

export type AdminStatsStore = AdminStatsState & AdminStatsActions;

export const useAdminStatsStore = create<AdminStatsStore>()(
  devtools(
    (set) => ({
      // Initial state
      systemStats: null,
      isLoading: false,
      error: null,

      // Actions
      loadSystemStats: async () => {
        set({ isLoading: true, error: null }, false, 'loadSystemStats/start');

        try {
          const response = await fetch('/api/admin/system');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load system statistics');
          }

          set({
            systemStats: result.data,
            isLoading: false
          }, false, 'loadSystemStats/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load system statistics';
          set({
            error: message,
            isLoading: false
          }, false, 'loadSystemStats/error');
        }
      },

      setError: (error) =>
        set({ error }, false, 'setError'),
    }),
    { name: 'admin-stats-store' }
  )
);

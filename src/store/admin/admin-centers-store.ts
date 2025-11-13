'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CenterForAdmin } from '@/types/computed';
import type {
  CreateCenterInput,
  UpdateCenterInput
} from '@/lib/validations';

interface AdminCentersState {
  centers: CenterForAdmin[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface AdminCentersActions {
  loadCenters: () => Promise<void>;
  createCenter: (data: CreateCenterInput) => Promise<void>;
  updateCenter: (id: string, data: UpdateCenterInput) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export type AdminCentersStore = AdminCentersState & AdminCentersActions;

export const useAdminCentersStore = create<AdminCentersStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      centers: [],
      isLoading: false,
      isSubmitting: false,
      error: null,

      // Actions
      loadCenters: async () => {
        set({ isLoading: true, error: null }, false, 'loadCenters/start');

        try {
          const response = await fetch('/api/admin/centers');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load centers');
          }

          // API returns { centers, pagination } so extract centers array
          const centers = result.data?.centers || result.data || [];

          set({
            centers,
            isLoading: false
          }, false, 'loadCenters/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load centers';
          set({
            error: message,
            isLoading: false
          }, false, 'loadCenters/error');
        }
      },

      createCenter: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'createCenter/start');

        try {
          const response = await fetch('/api/admin/centers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to create center');
          }

          // Reload centers to get fresh data
          await get().loadCenters();

          set({ isSubmitting: false }, false, 'createCenter/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create center';
          set({
            error: message,
            isSubmitting: false
          }, false, 'createCenter/error');
          throw error;
        }
      },

      updateCenter: async (id, data) => {
        set({ isSubmitting: true, error: null }, false, 'updateCenter/start');

        try {
          const response = await fetch(`/api/admin/centers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update center');
          }

          // Update local state
          const { centers } = get();
          const updatedCenters = centers.map(center =>
            center.id === id ? { ...center, ...result.data } : center
          );

          set({
            centers: updatedCenters,
            isSubmitting: false
          }, false, 'updateCenter/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update center';
          set({
            error: message,
            isSubmitting: false
          }, false, 'updateCenter/error');
          throw error;
        }
      },

      deleteCenter: async (id) => {
        set({ isSubmitting: true, error: null }, false, 'deleteCenter/start');

        try {
          const response = await fetch(`/api/admin/centers/${id}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to delete center');
          }

          // Remove from local state
          const { centers } = get();
          const filteredCenters = centers.filter(center => center.id !== id);

          set({
            centers: filteredCenters,
            isSubmitting: false
          }, false, 'deleteCenter/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete center';
          set({
            error: message,
            isSubmitting: false
          }, false, 'deleteCenter/error');
          throw error;
        }
      },

      setError: (error) =>
        set({ error }, false, 'setError'),
    }),
    { name: 'admin-centers-store' }
  )
);

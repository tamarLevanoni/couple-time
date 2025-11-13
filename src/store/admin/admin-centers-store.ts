'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CenterForAdmin } from '@/types';
import type {
  CreateCenterInput,
  UpdateCenterInput
} from '@/lib/validations';

interface AdminCentersState {
  centers: CenterForAdmin[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  warnings: string[];
}

interface AdminCentersActions {
  loadCenters: () => Promise<void>;
  createCenter: (data: CreateCenterInput) => Promise<void>;
  updateCenter: (id: string, data: UpdateCenterInput) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setWarnings: (warnings: string[]) => void;
  clearWarnings: () => void;
  clearError: () => void;
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
      warnings: [],

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
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'createCenter/start');

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

          // Handle warnings from API (now at top level)
          const warnings = result.warnings || [];

          // Add new center to local state
          const { centers } = get();
          const updatedCenters = [result.data, ...centers];

          set({
            centers: updatedCenters,
            isSubmitting: false,
            warnings
          }, false, 'createCenter/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create center';
          set({
            error: message,
            isSubmitting: false,
            warnings: []
          }, false, 'createCenter/error');
          throw error;
        }
      },

      updateCenter: async (id, data) => {
        console.log("🚀 ~ data:", data)
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'updateCenter/start');
        console.log("🚀 ~ JSON.stringify(data):", JSON.stringify(data))

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

          // Handle warnings from API
          const warnings = result.warnings || [];

          // Get previous center state to detect coordinator/super coordinator changes
          const { centers } = get();
          const previousCenter = centers.find(center => center.id === id);

          // Update local state
          const updatedCenters = centers.map(center =>
            center.id === id ? { ...center, ...result.data } : center
          );

          set({
            centers: updatedCenters,
            isSubmitting: false,
            warnings
          }, false, 'updateCenter/success');

          // Update users store if coordinator or super coordinator changed
          if (previousCenter) {
            const coordinatorChanged =
              data.coordinatorId !== undefined &&
              previousCenter.coordinator?.id !== result.data.coordinator?.id;

            const superCoordinatorChanged =
              data.superCoordinatorId !== undefined &&
              previousCenter.superCoordinator?.id !== result.data.superCoordinator?.id;

            if (coordinatorChanged || superCoordinatorChanged) {
              const { useAdminUsersStore } = await import('./admin-users-store');
              useAdminUsersStore.getState().updateUserFromCenterChange({
                previousCoordinatorId: coordinatorChanged ? previousCenter.coordinator?.id : undefined,
                newCoordinatorId: coordinatorChanged ? result.data.coordinator?.id : undefined,
                previousSuperCoordinatorId: superCoordinatorChanged ? previousCenter.superCoordinator?.id : undefined,
                newSuperCoordinatorId: superCoordinatorChanged ? result.data.superCoordinator?.id : undefined,
                centerBasicInfo: {
                  id: result.data.id,
                  name: result.data.name,
                  area: result.data.area,
                },
              });
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update center';
          set({
            error: message,
            isSubmitting: false,
            warnings: []
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

      setWarnings: (warnings) =>
        set({ warnings }, false, 'setWarnings'),

      clearWarnings: () =>
        set({ warnings: [] }, false, 'clearWarnings'),

      clearError: () =>
        set({ error: null }, false, 'clearError'),
    }),
    { name: 'admin-centers-store' }
  )
);

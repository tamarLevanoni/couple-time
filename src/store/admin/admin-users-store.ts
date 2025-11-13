'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UserForAdmin } from '@/types/computed';
import type {
  CreateUserInput,
  UpdateUserByAdminInput,
} from '@/lib/validations';
import type { Area } from '@/types/schema';

interface AdminUsersState {
  users: UserForAdmin[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  warnings: string[];
}

interface AdminUsersActions {
  loadUsers: () => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<void>;
  updateUser: (id: string, data: UpdateUserByAdminInput) => Promise<void>;
  updateUserFromCenterChange: (updates: {
    previousCoordinatorId?: string | null;
    newCoordinatorId?: string | null;
    previousSuperCoordinatorId?: string | null;
    newSuperCoordinatorId?: string | null;
    centerBasicInfo: { id: string; name: string; area: Area };
  }) => void;
  setError: (error: string | null) => void;
  setWarnings: (warnings: string[]) => void;
  clearWarnings: () => void;
  clearError: () => void;
}

export type AdminUsersStore = AdminUsersState & AdminUsersActions;

export const useAdminUsersStore = create<AdminUsersStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      warnings: [],

      // Actions
      loadUsers: async () => {
        set({ isLoading: true, error: null }, false, 'loadUsers/start');

        try {
          const response = await fetch('/api/admin/users');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load users');
          }

          // API returns { users, pagination } so extract users array
          const users = result.data?.users || result.data || [];

          set({
            users,
            isLoading: false
          }, false, 'loadUsers/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load users';
          set({
            error: message,
            isLoading: false
          }, false, 'loadUsers/error');
        }
      },

      createUser: async (data) => {
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'createUser/start');

        try {
          const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to create user');
          }

          // Handle warnings from API (now at top level)
          const warnings = result.warnings || [];

          // Add new center to local state
          const { users } = get();
          const updatedUsers = [result.data, ...users];

          set({
            users: updatedUsers,
            isSubmitting: false,
            warnings
          }, false, 'createUser/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create user';
          set({
            error: message,
            isSubmitting: false,
            warnings: []
          }, false, 'createUser/error');
          throw error;
        }
      },

      updateUser: async (id, data) => {
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'updateUser/start');

        try {
          const response = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update user');
          }

          // Update local state with returned user data
          const { users } = get();
          const updatedUsers = users.map(user =>
            user.id === id ? result.data : user
          );

          set({
            users: updatedUsers,
            isSubmitting: false
          }, false, 'updateUser/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update user';
          set({
            error: message,
            isSubmitting: false
          }, false, 'updateUser/error');
          throw error;
        }
      },

      updateUserFromCenterChange: (updates) => {
        const { users } = get();
        const {
          previousCoordinatorId,
          newCoordinatorId,
          previousSuperCoordinatorId,
          newSuperCoordinatorId,
          centerBasicInfo,
        } = updates;

        const updatedUsers = users.map((user) => {
          // Remove managedCenter from previous coordinator
          if (previousCoordinatorId && user.id === previousCoordinatorId) {
            return { ...user, managedCenter: undefined };
          }

          // Add managedCenter to new coordinator
          if (newCoordinatorId && user.id === newCoordinatorId) {
            return { ...user, managedCenter: centerBasicInfo };
          }

          // Remove center from previous super coordinator's supervisedCenters
          if (previousSuperCoordinatorId && user.id === previousSuperCoordinatorId) {
            return {
              ...user,
              supervisedCenters: user.supervisedCenters.filter(
                (center) => center.id !== centerBasicInfo.id
              ),
            };
          }

          // Add center to new super coordinator's supervisedCenters
          if (newSuperCoordinatorId && user.id === newSuperCoordinatorId) {
            const alreadySupervising = user.supervisedCenters.some(
              (center) => center.id === centerBasicInfo.id
            );
            return {
              ...user,
              supervisedCenters: alreadySupervising
                ? user.supervisedCenters
                : [...user.supervisedCenters, centerBasicInfo],
            };
          }

          return user;
        });

        set({ users: updatedUsers }, false, 'updateUserFromCenterChange');
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
    { name: 'admin-users-store' }
  )
);

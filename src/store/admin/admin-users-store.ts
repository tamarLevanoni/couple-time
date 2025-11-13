'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UserForAdmin } from '@/types/computed';
import type {
  CreateUserInput,
  UpdateUserByAdminInput,
} from '@/lib/validations';

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

          // Reload users to get fresh data
          await get().loadUsers();

          set({
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

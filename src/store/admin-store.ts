'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  GameWithInstances,
  CenterWithCoordinator,
  UserContact,
  Role
} from '@/types';
import type {
  CreateGameInput,
  UpdateGameInput,
  CreateCenterInput,
  UpdateCenterInput,
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput
} from '@/lib/validations';

interface AdminState {
  // Games management (US-4.3: Global Game Management)
  games: GameWithInstances[];
  
  // Centers management (US-4.2: Manage Centers)
  centers: CenterWithCoordinator[];
  
  // Users management (US-4.1: Manage Users)
  users: UserContact[];
  
  // System statistics (US-4.4: Reports and Statistics)
  systemStats: any | null;
  
  // Loading states
  isLoadingGames: boolean;
  isLoadingCenters: boolean;
  isLoadingUsers: boolean;
  isLoadingStats: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
}

interface AdminActions {
  // Game management (US-4.3: Global Game Management)
  loadGames: () => Promise<void>;
  createGame: (data: CreateGameInput) => Promise<void>;
  updateGame: (id: string, data: UpdateGameInput) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  
  // Center management (US-4.2: Manage Centers)
  loadCenters: () => Promise<void>;
  createCenter: (data: CreateCenterInput) => Promise<void>;
  updateCenter: (id: string, data: UpdateCenterInput) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;
  
  // User management (US-4.1: Manage Users)
  loadUsers: () => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<void>;
  updateUser: (id: string, data: UpdateUserInput) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  assignRole: (data: AssignRoleInput) => Promise<void>;
  
  // System statistics (US-4.4: Reports and Statistics)
  loadSystemStats: () => Promise<void>;
  
  // Utility actions
  setError: (error: string | null) => void;
}

export type AdminStore = AdminState & AdminActions;

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      games: [],
      centers: [],
      users: [],
      systemStats: null,
      isLoadingGames: false,
      isLoadingCenters: false,
      isLoadingUsers: false,
      isLoadingStats: false,
      isSubmitting: false,
      error: null,

      // Game management actions
      loadGames: async () => {
        set({ isLoadingGames: true, error: null }, false, 'loadGames/start');

        try {
          const response = await fetch('/api/admin/games');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load games');
          }

          set({ 
            games: result.data,
            isLoadingGames: false 
          }, false, 'loadGames/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load games';
          set({ 
            error: message,
            isLoadingGames: false 
          }, false, 'loadGames/error');
        }
      },

      createGame: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'createGame/start');

        try {
          const response = await fetch('/api/admin/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to create game');
          }

          // Reload games to get fresh data
          await get().loadGames();
          
          set({ isSubmitting: false }, false, 'createGame/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create game';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'createGame/error');
        }
      },

      updateGame: async (id, data) => {
        set({ isSubmitting: true, error: null }, false, 'updateGame/start');

        try {
          const response = await fetch(`/api/admin/games/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update game');
          }

          // Update local state
          const { games } = get();
          const updatedGames = games.map(game => 
            game.id === id ? { ...game, ...result.data } : game
          );
          
          set({ 
            games: updatedGames,
            isSubmitting: false 
          }, false, 'updateGame/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update game';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'updateGame/error');
        }
      },

      deleteGame: async (id) => {
        set({ isSubmitting: true, error: null }, false, 'deleteGame/start');

        try {
          const response = await fetch(`/api/admin/games/${id}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to delete game');
          }

          // Remove from local state
          const { games } = get();
          const filteredGames = games.filter(game => game.id !== id);
          
          set({ 
            games: filteredGames,
            isSubmitting: false 
          }, false, 'deleteGame/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete game';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'deleteGame/error');
        }
      },

      // Center management actions
      loadCenters: async () => {
        set({ isLoadingCenters: true, error: null }, false, 'loadCenters/start');

        try {
          const response = await fetch('/api/admin/centers');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load centers');
          }

          set({ 
            centers: result.data,
            isLoadingCenters: false 
          }, false, 'loadCenters/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load centers';
          set({ 
            error: message,
            isLoadingCenters: false 
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
        }
      },

      // User management actions
      loadUsers: async () => {
        set({ isLoadingUsers: true, error: null }, false, 'loadUsers/start');

        try {
          const response = await fetch('/api/admin/users');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load users');
          }

          set({ 
            users: result.data,
            isLoadingUsers: false 
          }, false, 'loadUsers/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load users';
          set({ 
            error: message,
            isLoadingUsers: false 
          }, false, 'loadUsers/error');
        }
      },

      createUser: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'createUser/start');

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

          // Reload users to get fresh data
          await get().loadUsers();
          
          set({ isSubmitting: false }, false, 'createUser/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create user';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'createUser/error');
        }
      },

      updateUser: async (id, data) => {
        set({ isSubmitting: true, error: null }, false, 'updateUser/start');

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

          // Update local state
          const { users } = get();
          const updatedUsers = users.map(user => 
            user.id === id ? { ...user, ...result.data } : user
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
        }
      },

      blockUser: async (id) => {
        await get().updateUser(id, { isActive: false });
      },

      unblockUser: async (id) => {
        await get().updateUser(id, { isActive: true });
      },

      assignRole: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'assignRole/start');

        try {
          const response = await fetch('/api/admin/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to assign role');
          }

          // Reload users to get fresh data
          await get().loadUsers();
          
          set({ isSubmitting: false }, false, 'assignRole/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to assign role';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'assignRole/error');
        }
      },

      // System statistics actions
      loadSystemStats: async () => {
        set({ isLoadingStats: true, error: null }, false, 'loadSystemStats/start');

        try {
          const response = await fetch('/api/admin/system');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load system statistics');
          }

          set({ 
            systemStats: result.data,
            isLoadingStats: false 
          }, false, 'loadSystemStats/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load system statistics';
          set({ 
            error: message,
            isLoadingStats: false 
          }, false, 'loadSystemStats/error');
        }
      },

      setError: (error) =>
        set({ error }, false, 'setError'),
    }),
    { name: 'admin-store' }
  )
);
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameWithInstances } from '@/types/models';
import type {
  CreateGameInput,
  UpdateGameInput
} from '@/lib/validations';

interface AdminGamesState {
  games: GameWithInstances[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  warnings: string[];
}

interface AdminGamesActions {
  loadGames: () => Promise<void>;
  createGame: (data: CreateGameInput) => Promise<void>;
  updateGame: (id: string, data: UpdateGameInput) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setWarnings: (warnings: string[]) => void;
  clearWarnings: () => void;
  clearError: () => void;
}

export type AdminGamesStore = AdminGamesState & AdminGamesActions;

export const useAdminGamesStore = create<AdminGamesStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      games: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
      warnings: [],

      // Actions
      loadGames: async () => {
        set({ isLoading: true, error: null }, false, 'loadGames/start');

        try {
          const response = await fetch('/api/admin/games');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load games');
          }

          // API returns { success: true, data: { games: Game[] } }
          const games = result.data.games;

          set({
            games,
            isLoading: false
          }, false, 'loadGames/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load games';
          set({
            error: message,
            isLoading: false
          }, false, 'loadGames/error');
        }
      },

      createGame: async (data) => {
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'createGame/start');

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

          // Handle warnings from API
          const warnings = result.warnings || [];

          // Add new game to local state
          const { games } = get();
          const updatedGames = [result.data, ...games];

          set({
            games: updatedGames,
            isSubmitting: false,
            warnings
          }, false, 'createGame/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create game';
          set({
            error: message,
            isSubmitting: false,
            warnings: []
          }, false, 'createGame/error');
          throw error;
        }
      },

      updateGame: async (id, data) => {
        set({ isSubmitting: true, error: null, warnings: [] }, false, 'updateGame/start');

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

          // Handle warnings from API
          const warnings = result.warnings || [];

          // Update local state
          const { games } = get();
          const updatedGames = games.map(game =>
            game.id === id ? { ...game, ...result.data } : game
          );

          set({
            games: updatedGames,
            isSubmitting: false,
            warnings
          }, false, 'updateGame/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update game';
          set({
            error: message,
            isSubmitting: false,
            warnings: []
          }, false, 'updateGame/error');
          throw error;
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
    { name: 'admin-games-store' }
  )
);

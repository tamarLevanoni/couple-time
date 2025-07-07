import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameCategory, TargetAudience, GameInstanceStatus } from '@prisma/client';

export interface Game {
  id: string;
  name: string;
  description?: string;
  categories: GameCategory[];
  targetAudiences: TargetAudience[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameInstance {
  id: string;
  gameId: string;
  centerId: string;
  status: GameInstanceStatus;
  expectedReturnDate?: Date;
  notes?: string;
  game: Game;
  center: {
    id: string;
    name: string;
    city: string;
  };
}

export interface GameWithInstances extends Game {
  instances: GameInstance[];
  availableCount: number;
  totalCount: number;
}

export interface GameFilters {
  categories?: GameCategory[];
  targetAudiences?: TargetAudience[];
  centerId?: string;
  availability?: 'available' | 'borrowed' | 'unavailable' | 'all';
  search?: string;
}

export interface GamesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface GamesState {
  // Data
  games: GameWithInstances[];
  selectedGame: GameWithInstances | null;
  categories: GameCategory[];
  targetAudiences: TargetAudience[];
  
  // Filters and pagination
  filters: GameFilters;
  pagination: GamesPagination;
  sortBy: 'name' | 'createdAt' | 'availableCount';
  sortOrder: 'asc' | 'desc';
  
  // UI state
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  setGames: (games: GameWithInstances[]) => void;
  addGame: (game: GameWithInstances) => void;
  updateGame: (id: string, updates: Partial<GameWithInstances>) => void;
  removeGame: (id: string) => void;
  setSelectedGame: (game: GameWithInstances | null) => void;
  updateGameInstance: (gameId: string, instanceId: string, updates: Partial<GameInstance>) => void;
  setFilters: (filters: Partial<GameFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<GamesPagination>) => void;
  setSorting: (sortBy: GamesState['sortBy'], sortOrder: GamesState['sortOrder']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Computed helpers
  getAvailableGames: () => GameWithInstances[];
  getGamesByCategory: (category: GameCategory) => GameWithInstances[];
  getGamesByCenter: (centerId: string) => GameWithInstances[];
  searchGames: (query: string) => GameWithInstances[];
}

const initialPagination: GamesPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
};

export const useGamesStore = create<GamesState>()(
  devtools(
    (set, get) => ({
      // Initial state
      games: [],
      selectedGame: null,
      categories: Object.values(GameCategory),
      targetAudiences: Object.values(TargetAudience),
      filters: {},
      pagination: initialPagination,
      sortBy: 'name',
      sortOrder: 'asc',
      loading: false,
      error: null,
      refreshing: false,

      // Actions
      setGames: (games) =>
        set(() => ({ games }), false, 'setGames'),

      addGame: (game) =>
        set((state) => ({
          games: [...state.games, game],
        }), false, 'addGame'),

      updateGame: (id, updates) =>
        set((state) => ({
          games: state.games.map(game =>
            game.id === id ? { ...game, ...updates } : game
          ),
          selectedGame: state.selectedGame?.id === id
            ? { ...state.selectedGame, ...updates }
            : state.selectedGame,
        }), false, 'updateGame'),

      removeGame: (id) =>
        set((state) => ({
          games: state.games.filter(game => game.id !== id),
          selectedGame: state.selectedGame?.id === id ? null : state.selectedGame,
        }), false, 'removeGame'),

      setSelectedGame: (game) =>
        set(() => ({ selectedGame: game }), false, 'setSelectedGame'),

      updateGameInstance: (gameId, instanceId, updates) =>
        set((state) => ({
          games: state.games.map(game =>
            game.id === gameId
              ? {
                  ...game,
                  instances: game.instances.map(instance =>
                    instance.id === instanceId ? { ...instance, ...updates } : instance
                  ),
                }
              : game
          ),
        }), false, 'updateGameInstance'),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page
        }), false, 'setFilters'),

      clearFilters: () =>
        set(() => ({
          filters: {},
          pagination: { ...initialPagination },
        }), false, 'clearFilters'),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        }), false, 'setPagination'),

      setSorting: (sortBy, sortOrder) =>
        set(() => ({ sortBy, sortOrder }), false, 'setSorting'),

      setLoading: (loading) =>
        set(() => ({ loading }), false, 'setLoading'),

      setError: (error) =>
        set(() => ({ error }), false, 'setError'),

      setRefreshing: (refreshing) =>
        set(() => ({ refreshing }), false, 'setRefreshing'),

      // Computed helpers
      getAvailableGames: () => {
        const { games } = get();
        return games.filter(game => game.availableCount > 0);
      },

      getGamesByCategory: (category) => {
        const { games } = get();
        return games.filter(game => game.categories.includes(category));
      },

      getGamesByCenter: (centerId) => {
        const { games } = get();
        return games.filter(game =>
          game.instances.some(instance => instance.centerId === centerId)
        );
      },

      searchGames: (query) => {
        const { games } = get();
        const lowerQuery = query.toLowerCase();
        return games.filter(game =>
          game.name.toLowerCase().includes(lowerQuery) ||
          game.description?.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'games-store',
    }
  )
);
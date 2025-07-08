import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  imageUrl: string;
  availableCount: number;
  totalInstances: number;
  availableCenters: number;
}

export interface GameDetails extends Game {
  centerAvailability: Array<{
    center: {
      id: string;
      name: string;
      city: string;
      area: string;
      coordinator: {
        id: string;
        name: string;
        phone: string;
        email: string;
      };
    };
    available: number;
    total: number;
    instances: Array<{
      id: string;
      status: string;
      expectedReturnDate: string | null;
    }>;
  }>;
}

interface GameFilters {
  search: string;
  category: string;
  targetAudience: string;
}

interface GamesState {
  // Data
  games: Game[];
  gameDetails: Record<string, GameDetails>;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: GameFilters;
  
  // Actions
  loadGames: () => Promise<void>;
  setFilters: (filters: GameFilters) => void;
  clearError: () => void;
  
  // Selectors
  getFilteredGames: () => Game[];
  getGameById: (id: string) => GameDetails | null;
}

export const useGamesStore = create<GamesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        games: [],
        gameDetails: {},
        loading: false,
        error: null,
        filters: {
          search: '',
          category: '',
          targetAudience: ''
        },

        // Actions
        loadGames: async () => {
          const { games, loading } = get();
          if (games.length > 0 || loading) {
            return; // Already loaded or currently loading
          }

          set({ loading: true, error: null });
          
          try {
            const response = await fetch('/api/games/full');
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error?.message || 'Failed to load games');
            }

            // Extract basic games list and detailed games
            const games = data.data.map((item: any) => item.basic);
            const gameDetails: Record<string, GameDetails> = {};
            
            data.data.forEach((item: any) => {
              gameDetails[item.basic.id] = item.details;
            });

            set({ 
              games, 
              gameDetails, 
              loading: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load games',
              loading: false 
            });
          }
        },


        setFilters: (filters: GameFilters) => {
          set({ filters });
        },

        clearError: () => {
          set({ error: null });
        },

        // Selectors
        getFilteredGames: () => {
          const { games, filters } = get();
          
          return games.filter(game => {
            const matchesSearch = !filters.search || 
              game.name.toLowerCase().includes(filters.search.toLowerCase()) ||
              game.description.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesCategory = !filters.category || game.category === filters.category;
            const matchesAudience = !filters.targetAudience || game.targetAudience === filters.targetAudience;
            
            return matchesSearch && matchesCategory && matchesAudience;
          });
        },

        getGameById: (id: string) => {
          return get().gameDetails[id] || null;
        }
      }),
      {
        name: 'games-store',
        partialize: (state) => ({
          games: state.games,
          gameDetails: state.gameDetails,
          // Don't persist UI state like loading, error, filters
        })
      }
    ),
    {
      name: 'games-store'
    }
  )
);
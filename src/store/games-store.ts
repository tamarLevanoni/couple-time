'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { GameBasic, GameCategory, TargetAudience } from '@/types';

interface GamesState {
  games: GameBasic[];
  selectedCategories: GameCategory[];
  selectedAudiences: TargetAudience[];
  selectedIds: string[];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
}

interface GamesActions {
  loadGames: () => Promise<void>;
  setCategories: (categories: GameCategory[]) => void;
  setAudiences: (audiences: TargetAudience[]) => void;
  setIds: (ids: string[]) => void;
  setSearch: (term: string) => void;
  clearFilters: () => void;
}

type GamesStore = GamesState & GamesActions;

export const useGamesStore = create<GamesStore>((set) => ({
  games: [],
  selectedCategories: [],
  selectedAudiences: [],
  selectedIds: [],
  searchTerm: '',
  isLoading: false,
  error: null,

  loadGames: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/public/games');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load games');
      }
      
      set({ games: result.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load games';
      set({ error: message, isLoading: false });
    }
  },

  setCategories: (categories) => set({ selectedCategories: categories }),
  setAudiences: (audiences) => set({ selectedAudiences: audiences }),
  setIds: (ids) => set({ selectedIds: ids }),
  setSearch: (term) => set({ searchTerm: term }),
  clearFilters: () => set({ 
    selectedCategories: [], 
    selectedAudiences: [], 
    selectedIds: [], 
    searchTerm: '' 
  }),
}));

// Atomic selectors - more efficient than useShallow
export const useGames = () => useGamesStore(state => state.games);
export const useSearchTerm = () => useGamesStore(state => state.searchTerm);
export const useSelectedCategories = () => useGamesStore(state => state.selectedCategories);
export const useSelectedAudiences = () => useGamesStore(state => state.selectedAudiences);
export const useSelectedIds = () => useGamesStore(state => state.selectedIds);
export const useGamesLoading = () => useGamesStore(state => state.isLoading);
export const useGamesError = () => useGamesStore(state => state.error);

// Game store actions - useShallow for multiple actions
export const useGamesActions = () => useGamesStore(useShallow(state => ({
  loadGames: state.loadGames,
  setCategories: state.setCategories,
  setAudiences: state.setAudiences,
  setIds: state.setIds,
  setSearch: state.setSearch,
  clearFilters: state.clearFilters,
})));

// Filter state - useShallow for multiple filter values
export const useGamesFilters = () => useGamesStore(useShallow(state => ({
  searchTerm: state.searchTerm,
  selectedCategories: state.selectedCategories,
  selectedAudiences: state.selectedAudiences,
  selectedIds: state.selectedIds,
})));

// Computed hook - simple function, no memoization needed for fast filtering
export const useFilteredGames = () => {
  const games = useGames();
  const { searchTerm, selectedCategories, selectedAudiences, selectedIds } = useGamesFilters();

  let filtered = games;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(game =>
      game.name.toLowerCase().includes(term) ||
      game.description?.toLowerCase().includes(term)
    );
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter(game =>
      game.categories.some(cat => selectedCategories.includes(cat))
    );
  }

  if (selectedAudiences.length > 0) {
    filtered = filtered.filter(game =>
      game.targetAudiences.some(aud => selectedAudiences.includes(aud))
    );
  }

  if (selectedIds.length > 0) {
    filtered = filtered.filter(game =>
      selectedIds.includes(game.id)
    );
  }

  return filtered;
};


// Simple computations - no memoization needed unless games array is huge
export const useAvailableCategories = () => {
  const games = useGames();
  
  const categories = new Set<GameCategory>();
  games.forEach(game => {
    game.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories);
};

export const useAvailableAudiences = () => {
  const games = useGames();
  
  const audiences = new Set<TargetAudience>();
  games.forEach(game => {
    game.targetAudiences.forEach(aud => audiences.add(aud));
  });
  return Array.from(audiences);
};
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

// פונקציה חיצונית טהורה
const selectFilteredGames = (state: GamesState) => {
  const { games, searchTerm, selectedCategories, selectedAudiences, selectedIds } = state;

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

export const useFilteredGames = () => {
  return useGamesStore(useShallow(selectFilteredGames));
};


export const useAvailableCategories = () => {
  return useGamesStore(useShallow((state) => {
    const categories = new Set<GameCategory>();
    state.games.forEach(game => {
      game.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }));
};

export const useAvailableAudiences = () => {
  return useGamesStore(useShallow((state) => {
    const audiences = new Set<TargetAudience>();
    state.games.forEach(game => {
      game.targetAudiences.forEach(aud => audiences.add(aud));
    });
    return Array.from(audiences);
  }));
};
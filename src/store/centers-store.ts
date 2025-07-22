'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { CenterPublicInfo, Area } from '@/types';

interface CentersState {
  centers: CenterPublicInfo[];
  selectedArea: Area | null;
  selectedCity: string | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

interface CentersActions {
  loadCenters: () => Promise<void>;
  forceReloadCenters: () => Promise<void>;
  setArea: (area: Area | null) => void;
  setCity: (city: string | null) => void;
  setSearch: (term: string) => void;
  clearFilters: () => void;
}

type CentersStore = CentersState & CentersActions;

export const useCentersStore = create<CentersStore>((set, get) => ({
  centers: [],
  selectedArea: null,
  selectedCity: null,
  searchTerm: '',
  isLoading: false,
  error: null,
  hasLoaded: false,

  loadCenters: async () => {
    // Only load if not already loaded
    if (get().hasLoaded) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/public/centers');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load centers');
      }
      
      set({ centers: result.data, isLoading: false, hasLoaded: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load centers';
      set({ error: message, isLoading: false });
    }
  },

  forceReloadCenters: async () => {
    set({ isLoading: true, error: null, hasLoaded: false });
    try {
      const response = await fetch('/api/public/centers');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load centers');
      }
      
      set({ centers: result.data, isLoading: false, hasLoaded: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load centers';
      set({ error: message, isLoading: false });
    }
  },

  setArea: (area) => set({ selectedArea: area }),
  setCity: (city) => set({ selectedCity: city }),
  setSearch: (term) => set({ searchTerm: term }),
  clearFilters: () => set({ 
    selectedArea: null, 
    selectedCity: null, 
    searchTerm: '' 
  }),
}));

// Atomic selectors - more efficient than useShallow
export const useCenters = () => useCentersStore(state => state.centers);
export const useCentersSearchTerm = () => useCentersStore(state => state.searchTerm);
export const useSelectedArea = () => useCentersStore(state => state.selectedArea);
export const useSelectedCity = () => useCentersStore(state => state.selectedCity);
export const useCentersLoading = () => useCentersStore(state => state.isLoading);
export const useCentersError = () => useCentersStore(state => state.error);
export const useCentersHasLoaded = () => useCentersStore(state => state.hasLoaded);

// Centers store actions - useShallow for multiple actions
export const useCentersActions = () => useCentersStore(useShallow(state => ({
  loadCenters: state.loadCenters,
  forceReloadCenters: state.forceReloadCenters,
  setArea: state.setArea,
  setCity: state.setCity,
  setSearch: state.setSearch,
  clearFilters: state.clearFilters,
})));

// Filter state - useShallow for multiple filter values
export const useCentersFilters = () => useCentersStore(useShallow(state => ({
  searchTerm: state.searchTerm,
  selectedArea: state.selectedArea,
  selectedCity: state.selectedCity,
})));

export const useFilteredCenters = () => {
  return useCentersStore(useShallow((state) => {
    const { centers, searchTerm, selectedArea, selectedCity } = state;
    
    let filtered = centers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(term) ||
        center.city.toLowerCase().includes(term)
      );
    }

    if (selectedArea) {
      filtered = filtered.filter(center => center.area === selectedArea);
    }

    if (selectedCity) {
      filtered = filtered.filter(center => 
        center.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    return filtered;
  }));
};

export const useAvailableCities = () => {
  return useCentersStore(useShallow((state) => {
    const cities = new Set(state.centers.map(center => center.city));
    return Array.from(cities).sort();
  }));
};
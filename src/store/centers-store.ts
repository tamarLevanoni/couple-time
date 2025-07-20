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
}

interface CentersActions {
  loadCenters: () => Promise<void>;
  setArea: (area: Area | null) => void;
  setCity: (city: string | null) => void;
  setSearch: (term: string) => void;
  clearFilters: () => void;
}

type CentersStore = CentersState & CentersActions;

export const useCentersStore = create<CentersStore>((set) => ({
  centers: [],
  selectedArea: null,
  selectedCity: null,
  searchTerm: '',
  isLoading: false,
  error: null,

  loadCenters: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/public/centers');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load centers');
      }
      
      set({ centers: result.data, isLoading: false });
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
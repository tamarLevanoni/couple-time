import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Area } from '@prisma/client';

export interface Center {
  id: string;
  name: string;
  city: string;
  area: Area;
  coordinatorId?: string;
  superCoordinatorId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  coordinator?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  superCoordinator?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CenterWithStats extends Center {
  stats: {
    totalGames: number;
    availableGames: number;
    activeRentals: number;
    pendingRequests: number;
  };
}

export interface CenterFilters {
  area?: Area;
  hasCoordinator?: boolean;
  isActive?: boolean;
  search?: string;
}

interface CentersState {
  // Data
  centers: CenterWithStats[];
  selectedCenter: CenterWithStats | null;
  areas: Area[];
  
  // Filters
  filters: CenterFilters;
  
  // UI state
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  setCenters: (centers: CenterWithStats[]) => void;
  addCenter: (center: CenterWithStats) => void;
  updateCenter: (id: string, updates: Partial<CenterWithStats>) => void;
  removeCenter: (id: string) => void;
  setSelectedCenter: (center: CenterWithStats | null) => void;
  setFilters: (filters: Partial<CenterFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Computed helpers
  getActiveCenters: () => CenterWithStats[];
  getCentersByArea: (area: Area) => CenterWithStats[];
  getCentersWithoutCoordinator: () => CenterWithStats[];
  getCentersByCoordinator: (coordinatorId: string) => CenterWithStats[];
  searchCenters: (query: string) => CenterWithStats[];
}

export const useCentersStore = create<CentersState>()(
  devtools(
    (set, get) => ({
      // Initial state
      centers: [],
      selectedCenter: null,
      areas: Object.values(Area),
      filters: {},
      loading: false,
      error: null,
      refreshing: false,

      // Actions
      setCenters: (centers) =>
        set(() => ({ centers }), false, 'setCenters'),

      addCenter: (center) =>
        set((state) => ({
          centers: [...state.centers, center],
        }), false, 'addCenter'),

      updateCenter: (id, updates) =>
        set((state) => ({
          centers: state.centers.map(center =>
            center.id === id ? { ...center, ...updates } : center
          ),
          selectedCenter: state.selectedCenter?.id === id
            ? { ...state.selectedCenter, ...updates }
            : state.selectedCenter,
        }), false, 'updateCenter'),

      removeCenter: (id) =>
        set((state) => ({
          centers: state.centers.filter(center => center.id !== id),
          selectedCenter: state.selectedCenter?.id === id ? null : state.selectedCenter,
        }), false, 'removeCenter'),

      setSelectedCenter: (center) =>
        set(() => ({ selectedCenter: center }), false, 'setSelectedCenter'),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }), false, 'setFilters'),

      clearFilters: () =>
        set(() => ({
          filters: {},
        }), false, 'clearFilters'),

      setLoading: (loading) =>
        set(() => ({ loading }), false, 'setLoading'),

      setError: (error) =>
        set(() => ({ error }), false, 'setError'),

      setRefreshing: (refreshing) =>
        set(() => ({ refreshing }), false, 'setRefreshing'),

      // Computed helpers
      getActiveCenters: () => {
        const { centers } = get();
        return centers.filter(center => center.isActive);
      },

      getCentersByArea: (area) => {
        const { centers } = get();
        return centers.filter(center => center.area === area);
      },

      getCentersWithoutCoordinator: () => {
        const { centers } = get();
        return centers.filter(center => !center.coordinatorId);
      },

      getCentersByCoordinator: (coordinatorId) => {
        const { centers } = get();
        return centers.filter(center => center.coordinatorId === coordinatorId);
      },

      searchCenters: (query) => {
        const { centers } = get();
        const lowerQuery = query.toLowerCase();
        return centers.filter(center =>
          center.name.toLowerCase().includes(lowerQuery) ||
          center.city.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'centers-store',
    }
  )
);
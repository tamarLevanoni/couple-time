import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Center {
  id: string;
  name: string;
  city: string;
  area: string;
  location: any;
  coordinator: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  superCoordinator: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  games: Array<{
    game: {
      id: string;
      name: string;
      description: string;
      category: string;
      targetAudience: string;
      imageUrl: string;
    };
    availableCount: number;
    totalCount: number;
    instances: Array<{
      instanceId: string;
      status: string;
      expectedReturnDate: string | null;
      currentRental: any;
    }>;
  }>;
  stats: {
    totalGames: number;
    activeRentals: number;
    availableGames: number;
  };
}

interface CenterFilters {
  search: string;
  area: string;
  city: string;
}

interface CentersState {
  // Data
  centers: Center[];
  centerDetails: Record<string, Center>;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: CenterFilters;
  
  // Actions
  loadCenters: () => Promise<void>;
  setFilters: (filters: CenterFilters) => void;
  clearError: () => void;
  
  // Selectors
  getFilteredCenters: () => Center[];
  getCenterById: (id: string) => Center | null;
  getUniqueAreas: () => string[];
  getUniqueCities: () => string[];
}

export const useCentersStore = create<CentersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        centers: [],
        centerDetails: {},
        loading: false,
        error: null,
        filters: {
          search: '',
          area: '',
          city: ''
        },

        // Actions
        loadCenters: async () => {
          const { centers, loading } = get();
          if (centers.length > 0 || loading) {
            return; // Already loaded or currently loading
          }

          set({ loading: true, error: null });
          
          try {
            const response = await fetch('/api/centers/full');
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error?.message || 'Failed to load centers');
            }

            // Extract basic centers list and detailed centers
            const centers = data.data.map((item: any) => item.basic);
            const centerDetails: Record<string, Center> = {};
            
            data.data.forEach((item: any) => {
              centerDetails[item.basic.id] = item.details;
            });

            set({ 
              centers, 
              centerDetails, 
              loading: false 
            });

          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load centers',
              loading: false 
            });
          }
        },

        setFilters: (filters: CenterFilters) => {
          set({ filters });
        },

        clearError: () => {
          set({ error: null });
        },

        // Selectors
        getFilteredCenters: () => {
          const { centers, filters } = get();
          
          return centers.filter(center => {
            const matchesSearch = !filters.search || 
              center.name.toLowerCase().includes(filters.search.toLowerCase()) ||
              center.city.toLowerCase().includes(filters.search.toLowerCase()) ||
              center.area.toLowerCase().includes(filters.search.toLowerCase());
            
            const matchesArea = !filters.area || center.area === filters.area;
            const matchesCity = !filters.city || center.city === filters.city;
            
            return matchesSearch && matchesArea && matchesCity;
          });
        },

        getCenterById: (id: string) => {
          return get().centerDetails[id] || null;
        },

        getUniqueAreas: () => {
          const centers = get().centers;
          return Array.from(new Set(centers.map(center => center.area))).sort();
        },

        getUniqueCities: () => {
          const centers = get().centers;
          return Array.from(new Set(centers.map(center => center.city))).sort();
        }
      }),
      {
        name: 'centers-store',
        partialize: (state) => ({
          centers: state.centers,
          centerDetails: state.centerDetails,
          // Don't persist UI state like loading, error, filters
        })
      }
    ),
    {
      name: 'centers-store'
    }
  )
);
'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { 
  CoordinatorDashboardData,
  RentalForCoordinator,
  GameInstanceWithGame,
  RentalStatus
} from '@/types';
import type {
  CreateManualRentalInput,
  UpdateRentalByCoordinatorInput,
  UpdateGameInstancePartialInput
} from '@/lib/validations';

interface CoordinatorState {
  // Dashboard data (US-2.1: View Dashboard)
  dashboardData: CoordinatorDashboardData | null;
  
  // Rentals data (already included in dashboard, but separate for filtering)
  rentals: RentalForCoordinator[];
  
  // Game instances for this coordinator's center
  gameInstances: GameInstanceWithGame[];
  
  // Filters
  selectedRentalStatus: RentalStatus | 'ALL';
  showOverdueOnly: boolean;
  
  // Loading states
  isLoadingDashboard: boolean;
  isLoadingRentals: boolean;
  isLoadingGames: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
}

interface CoordinatorActions {
  // Dashboard actions (US-2.1: View Dashboard)
  loadDashboard: () => Promise<void>;
  
  // Rental management (US-2.2: Approve Rental, US-2.3: Manage Active Rentals)
  loadRentals: () => Promise<void>;
  approveRental: (rentalId: string) => Promise<void>;
  updateRental: (rentalId: string, data: UpdateRentalByCoordinatorInput) => Promise<void>;
  markRentalReturned: (rentalId: string) => Promise<void>;
  createManualRental: (data: CreateManualRentalInput) => Promise<void>;
  
  // Game instance management (US-2.4: Update Game)
  loadGameInstances: () => Promise<void>;
  updateGameInstance: (instanceId: string, data: UpdateGameInstancePartialInput) => Promise<void>;
  
  // Filtering
  filterRentalsByStatus: (status: RentalStatus | 'ALL') => void;
  toggleOverdueOnly: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
}

export type CoordinatorStore = CoordinatorState & CoordinatorActions;

export const useCoordinatorStore = create<CoordinatorStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      dashboardData: null,
      rentals: [],
      gameInstances: [],
      selectedRentalStatus: 'ALL',
      showOverdueOnly: false,
      isLoadingDashboard: false,
      isLoadingRentals: false,
      isLoadingGames: false,
      isSubmitting: false,
      error: null,

      // Dashboard actions
      loadDashboard: async () => {
        set({ isLoadingDashboard: true, error: null }, false, 'loadDashboard/start');

        try {
          const response = await fetch('/api/coordinator');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load dashboard');
          }

          set({ 
            dashboardData: result.data,
            rentals: result.data.rentals || [],
            isLoadingDashboard: false 
          }, false, 'loadDashboard/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load dashboard';
          set({ 
            error: message,
            isLoadingDashboard: false 
          }, false, 'loadDashboard/error');
        }
      },

      // Rental management actions
      loadRentals: async () => {
        set({ isLoadingRentals: true, error: null }, false, 'loadRentals/start');

        try {
          const response = await fetch('/api/coordinator/rentals');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load rentals');
          }
          console.log('rentals', result.data.length)

          set({ 
            rentals: result.data,
            isLoadingRentals: false 
          }, false, 'loadRentals/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load rentals';
          set({ 
            error: message,
            isLoadingRentals: false 
          }, false, 'loadRentals/error');
        }
      },

      approveRental: async (rentalId) => {
        set({ isSubmitting: true, error: null }, false, 'approveRental/start');

        try {
          const data:UpdateRentalByCoordinatorInput={
            borrowDate: new Date().toISOString(),
            expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
          const response = await fetch(`/api/coordinator/rentals/${rentalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to approve rental');
          }

          // Update local state
          const { rentals } = get();
          const updatedRentals = rentals.map(rental => 
            rental.id === rentalId ? { ...rental, ...result.data } : rental
          );
          
          set({ 
            rentals: updatedRentals,
            isSubmitting: false 
          }, false, 'approveRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to approve rental';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'approveRental/error');
        }
      },

      updateRental: async (rentalId, data) => {
        set({ isSubmitting: true, error: null }, false, 'updateRental/start');

        try {
          const response = await fetch(`/api/coordinator/rentals/${rentalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update rental');
          }

          // Update local state
          const { rentals } = get();
          const updatedRentals = rentals.map(rental => 
            rental.id === rentalId ? { ...rental, ...result.data } : rental
          );
          
          set({ 
            rentals: updatedRentals,
            isSubmitting: false 
          }, false, 'updateRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update rental';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'updateRental/error');
        }
      },

      markRentalReturned: async (rentalId) => {
        set({ isSubmitting: true, error: null }, false, 'markRentalReturned/start');

        try {
          const response = await fetch(`/api/coordinator/rentals/${rentalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              returnDate: new Date().toISOString()
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to mark rental as returned');
          }

          // Update local state
          const { rentals } = get();
          const updatedRentals = rentals.map(rental => 
            rental.id === rentalId ? { ...rental, ...result.data } : rental
          );
          
          set({ 
            rentals: updatedRentals,
            isSubmitting: false 
          }, false, 'markRentalReturned/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to mark rental as returned';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'markRentalReturned/error');
        }
      },

      createManualRental: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'createManualRental/start');

        try {
          const response = await fetch('/api/coordinator/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to create manual rental');
          }

          // Reload rentals to get fresh data
          await get().loadRentals();
          
          set({ isSubmitting: false }, false, 'createManualRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create manual rental';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'createManualRental/error');
        }
      },

      // Game instance actions
      loadGameInstances: async () => {
        set({ isLoadingGames: true, error: null }, false, 'loadGameInstances/start');

        try {
          const response = await fetch('/api/coordinator/games');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load game instances');
          }

          set({ 
            gameInstances: result.data,
            isLoadingGames: false 
          }, false, 'loadGameInstances/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load game instances';
          set({ 
            error: message,
            isLoadingGames: false 
          }, false, 'loadGameInstances/error');
        }
      },

      updateGameInstance: async (instanceId, data) => {
        set({ isSubmitting: true, error: null }, false, 'updateGameInstance/start');

        try {
          const response = await fetch(`/api/coordinator/games/${instanceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update game instance');
          }

          // Update local state
          const { gameInstances } = get();
          const updatedInstances = gameInstances.map(instance => 
            instance.id === instanceId ? { ...instance, ...result.data } : instance
          );
          
          set({ 
            gameInstances: updatedInstances,
            isSubmitting: false 
          }, false, 'updateGameInstance/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update game instance';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'updateGameInstance/error');
        }
      },

      // Filtering actions
      filterRentalsByStatus: (status) =>
        set({ selectedRentalStatus: status }, false, 'filterRentalsByStatus'),

      toggleOverdueOnly: () =>
        set((state) => ({ showOverdueOnly: !state.showOverdueOnly }), false, 'toggleOverdueOnly'),

      setError: (error) =>
        set({ error }, false, 'setError'),
    }),
    { name: 'coordinator-store' }
  )
);

// Computed selectors for filtered rentals
export const useFilteredCoordinatorRentals = () => {
  return useCoordinatorStore(useShallow((state) => {
    let filtered = state.rentals;

    // Filter by status
    if (state.selectedRentalStatus !== 'ALL') {
      filtered = filtered.filter(rental => rental.status === state.selectedRentalStatus);
    }

    // Filter by overdue (if active rentals past expected return date)
    if (state.showOverdueOnly) {
      const now = new Date();
      filtered = filtered.filter(rental => 
        rental.status === 'ACTIVE' && 
        rental.expectedReturnDate && 
        new Date(rental.expectedReturnDate) < now
      );
    }

    return filtered;
  }));
};

// Get rental counts for dashboard
export const useCoordinatorRentalCounts = () => {
  return useCoordinatorStore(useShallow((state) => {
    const pending = state.rentals.filter(r => r.status === 'PENDING').length;
    const active = state.rentals.filter(r => r.status === 'ACTIVE').length;
    
    // Count overdue (active rentals past expected return date)
    const now = new Date();
    const overdue = state.rentals.filter(r => 
      r.status === 'ACTIVE' && 
      r.expectedReturnDate && 
      new Date(r.expectedReturnDate) < now
    ).length;
    
    return { pending, active, overdue, total: state.rentals.length };
  }));
};
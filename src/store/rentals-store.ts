'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { 
  RentalForUser,
  RentalStatus
} from '@/types';
import type {
  CreateRentalInput
} from '@/lib/validations';

interface RentalsState {
  // User rentals data (US-1.4: Manage My Rentals)
  userRentals: RentalForUser[];
  
  // Filters
  selectedStatus: RentalStatus | 'ALL';
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
}

interface RentalsActions {
  // User rental actions (US-1.3: Request Rental, US-1.4: Manage My Rentals)
  loadUserRentals: () => Promise<void>;
  createRental: (data: CreateRentalInput) => Promise<void>;
  cancelRental: (rentalId: string) => Promise<void>;
  filterByStatus: (status: RentalStatus | 'ALL') => void;
  
  // Utility actions
  setError: (error: string | null) => void;
}

export type RentalsStore = RentalsState & RentalsActions;

export const useRentalsStore = create<RentalsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      userRentals: [],
      selectedStatus: 'ALL',
      isLoading: false,
      isSubmitting: false,
      error: null,

      // User rental actions
      loadUserRentals: async () => {
        set({ isLoading: true, error: null }, false, 'loadUserRentals/start');

        try {
          const response = await fetch('/api/user/rentals');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load rentals');
          }

          set({ 
            userRentals: result.data,
            isLoading: false 
          }, false, 'loadUserRentals/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load rentals';
          set({ 
            error: message,
            isLoading: false 
          }, false, 'loadUserRentals/error');
        }
      },

      createRental: async (data) => {
        set({ isSubmitting: true, error: null }, false, 'createRental/start');

        try {
          const response = await fetch('/api/user/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to create rental');
          }

          // Reload rentals to get fresh data
          await get().loadUserRentals();
          
          set({ isSubmitting: false }, false, 'createRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create rental';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'createRental/error');
        }
      },

      cancelRental: async (rentalId) => {
        set({ isSubmitting: true, error: null }, false, 'cancelRental/start');

        try {
          const response = await fetch(`/api/user/rentals/${rentalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cancel' }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to cancel rental');
          }

          // Update local state
          const { userRentals } = get();
          const updatedRentals = userRentals.map(rental => 
            rental.id === rentalId 
              ? { ...rental, status: 'CANCELLED' as RentalStatus }
              : rental
          );
          
          set({ 
            userRentals: updatedRentals,
            isSubmitting: false 
          }, false, 'cancelRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to cancel rental';
          set({ 
            error: message,
            isSubmitting: false 
          }, false, 'cancelRental/error');
        }
      },

      filterByStatus: (status) =>
        set({ selectedStatus: status }, false, 'filterByStatus'),

      setError: (error) =>
        set({ error }, false, 'setError'),
    }),
    { name: 'rentals-store' }
  )
);

// Computed selectors for filtered rentals
export const useFilteredUserRentals = () => {
  return useRentalsStore(useShallow((state) => {
    if (state.selectedStatus === 'ALL') {
      return state.userRentals;
    }
    
    return state.userRentals.filter(rental => 
      rental.status === state.selectedStatus
    );
  }));
};

// Get rentals by status for tab counts (US-1.4: see pending/active/history)
export const useRentalCounts = () => {
  return useRentalsStore(useShallow((state) => {
    const pending = state.userRentals.filter(r => r.status === 'PENDING').length;
    const active = state.userRentals.filter(r => r.status === 'ACTIVE').length;
    const returned = state.userRentals.filter(r => r.status === 'RETURNED').length;
    const cancelled = state.userRentals.filter(r => r.status === 'CANCELLED').length;
    
    return {
      pending,
      active,
      returned,
      cancelled,
      total: state.userRentals.length
    };
  }));
};

// Check if rental can be cancelled (only PENDING status)
export const useCanCancelRental = (rentalId: string) => {
  return useRentalsStore((state) => {
    const rental = state.userRentals.find(r => r.id === rentalId);
    return rental?.status === 'PENDING';
  });
};
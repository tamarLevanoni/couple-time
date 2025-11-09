'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
  RentalForUser,
  RentalStatus
} from '@/types';
import type {
  CreateRentalInput,
  RentalStatusSchema
} from '@/lib/validations';

interface RentalsState {
  // User rentals data (US-1.4: Manage My Rentals)
  userRentals: RentalForUser[];
  
  // Filters
  selectedStatus: RentalStatus;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
  
  // Caching
  hasLoaded: boolean;
}

interface RentalsActions {
  // User rental actions (US-1.3: Request Rental, US-1.4: Manage My Rentals)
  loadUserRentals: () => Promise<void>;
  createRental: (data: CreateRentalInput) => Promise<void>;
  cancelRental: (rentalId: string) => Promise<void>;
  filterByStatus: (status: RentalStatus) => void;
  
  // Utility actions
  setError: (error: string | null) => void;
}

export type RentalsStore = RentalsState & RentalsActions;

export const useRentalsStore = create<RentalsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      userRentals: [],
      selectedStatus: 'ACTIVE',
      isLoading: false,
      isSubmitting: false,
      error: null,
      hasLoaded: false,

      // User rental actions
      loadUserRentals: async () => {
        console.log('📦 loadUserRentals called, hasLoaded:', get().hasLoaded);

        // Only load if not already loaded
        if (get().hasLoaded) {
          console.log('⏭️  Skipping - already loaded');
          return;
        }

        console.log('🚀 Starting rentals fetch...');
        set({ isLoading: true, error: null }, false, 'loadUserRentals/start');

        try {
          const response = await fetch('/api/user/rentals');
          const result = await response.json();
          console.log("✅ response rentals", result)

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load rentals');
          }

          set({
            userRentals: result.data,
            isLoading: false,
            hasLoaded: true
          }, false, 'loadUserRentals/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load rentals';
          console.error('❌ Error loading rentals:', message);
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
            const errorCode = result.error?.code;
            const apiMessage = result.error?.message || 'Failed to create rental';

            // Only pass user-facing errors (with error codes) to the form
            // Developer errors are logged but return generic message
            if (errorCode=="USER_ERROR") {
              // User error - throw the API message
              throw new Error(apiMessage);
            } else {
              // Developer error - log it and throw generic message
              console.error('API error without code:', apiMessage);
              throw new Error('שגיאה ביצירת הבקשה. אנא נסו שוב.');
            }
          }

          // Add new rental to local state (optimistic update with server response)
          const { userRentals } = get();
          const updatedRentals = [result.data, ...userRentals];

          set({
            userRentals: updatedRentals,
            isSubmitting: false
          }, false, 'createRental/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create rental';
          set({
            error: message,
            isSubmitting: false
          }, false, 'createRental/error');
          throw error; // Re-throw to allow form to handle the error
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

          // Update local state with server response
          const { userRentals } = get();
          const updatedRentals = userRentals.map(rental =>
            rental.id === rentalId ? result.data : rental
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
          throw error; // Re-throw to allow caller to handle the error
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
      cancelled
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
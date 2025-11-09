'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { 
  UserWithActiveRentals,
  RentalForUser,
  RentalStatus 
} from '@/types';

interface UserState {
  // Complete user data from /api/user
  user: UserWithActiveRentals | null;
  
  // Loading states
  isLoading: boolean;
  
  // Error states
  error: string | null;
}

interface UserActions {
  // User data management
  loadUserData: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      // Load complete user data from /api/user
      loadUserData: async () => {
        set({ isLoading: true, error: null }, false, 'loadUserData/start');

        try {
          const response = await fetch('/api/user');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to load user data');
          }

          set({ 
            user: result.data,
            isLoading: false 
          }, false, 'loadUserData/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load user data';
          set({ 
            error: message,
            isLoading: false 
          }, false, 'loadUserData/error');
        }
      },

      // Update user profile
      updateProfile: async (data) => {
        const { user } = get();
        
        if (!user) {
          set({ error: 'No user data to update' }, false, 'updateProfile/error');
          return;
        }

        set({ isLoading: true, error: null }, false, 'updateProfile/start');

        try {
          const response = await fetch('/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update profile');
          }

          // Update only the basic profile fields (PUT only returns UserContact)
          set({ 
            user: { 
              ...user, 
              firstName: result.data.firstName || user.firstName,
              lastName: result.data.lastName || user.lastName,
              phone: result.data.phone || user.phone
            },
            isLoading: false 
          }, false, 'updateProfile/success');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update profile';
          set({ 
            error: message,
            isLoading: false 
          }, false, 'updateProfile/error');
        }
      },

      // Clear user data (logout)
      clearUser: () => {
        set({ 
          user: null, 
          error: null 
        }, false, 'clearUser');
      },

      setError: (error) => {
        set({ error }, false, 'setError');
      },
    }),
    { name: 'user-store' }
  )
);

// Atomic selectors
export const useUser = () => useUserStore(state => state.user);
export const useUserLoading = () => useUserStore(state => state.isLoading);
export const useUserError = () => useUserStore(state => state.error);

// User actions
export const useUserActions = () => useUserStore(useShallow(state => ({
  loadUserData: state.loadUserData,
  updateProfile: state.updateProfile,
  clearUser: state.clearUser,
  setError: state.setError,
})));

// Profile data with useShallow for object
export const useUserProfile = () => {
  return useUserStore(useShallow((state) => {
    if (!state.user) return null;
    return {
      id: state.user.id,
      firstName: state.user.firstName,
      lastName: state.user.lastName,
      email: state.user.email,
      phone: state.user.phone,
      createdAt: state.user.createdAt,
      updatedAt: state.user.updatedAt
    };
  }));
};

export const useUserRoles = () => {
  return useUserStore(useShallow((state) => state.user?.roles || []));
};

export const useUserManagedCenter = () => {
  return useUserStore((state) => state.user?.managedCenterId || null);
};

export const useUserActiveRentals = () => {
  return useUserStore(useShallow((state) => state.user?.rentals || []));
};

// Role-based selectors
export const useIsCoordinator = () => {
  return useUserStore((state) => 
    state.user?.roles?.includes('CENTER_COORDINATOR') || false
  );
};

export const useIsSuperCoordinator = () => {
  return useUserStore((state) => 
    state.user?.roles?.includes('SUPER_COORDINATOR') || false
  );
};

export const useIsAdmin = () => {
  return useUserStore((state) => 
    state.user?.roles?.includes('ADMIN') || false
  );
};

export const useHasPrivilegedRole = () => {
  return useUserStore((state) => {
    if (!state.user?.roles) return false;
    return state.user.roles.some(role => 
      ['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN'].includes(role)
    );
  });
};

// Rental-related selectors
export const useUserRentalsByStatus = (status: RentalStatus | 'ALL') => {
  return useUserStore(useShallow((state) => {
    if (!state.user?.rentals) return [];
    if (status === 'ALL') return state.user.rentals;
    return state.user.rentals.filter(rental => rental.status === status);
  }));
};

export const useUserRentalCounts = () => {
  return useUserStore(useShallow((state) => {
    if (!state.user?.rentals) return { pending: 0, active: 0, returned: 0, cancelled: 0};
    
    const rentals = state.user.rentals;
    return {
      pending: rentals.filter(r => r.status === 'PENDING').length,
      active: rentals.filter(r => r.status === 'ACTIVE').length,
      returned: rentals.filter(r => r.status === 'RETURNED').length,
      cancelled: rentals.filter(r => r.status === 'CANCELLED').length
    };
  }));
};
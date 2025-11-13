// Central store exports - organized by user role and functionality
//
// This file provides clean imports for all Zustand stores:
// - Public stores: For browsing games and centers
// - User stores: For authentication and rental management
// - Coordinator stores: For center management operations
// - Admin stores: For system-wide administration
//
// Usage examples:
// import { useAuthStore, useGamesStore } from '@/store';
// import { useCoordinatorStore } from '@/store';
// import { useAdminStore } from '@/store';

// ===== PUBLIC STORES =====
// Available to all users for browsing

export { 
  useGamesStore, 
  useFilteredGames, 
  useAvailableCategories, 
  useAvailableAudiences,
  useGamesActions,
  useGames,
  useGameById
} from './games-store';
export { useCentersStore, useFilteredCenters, useCenterById } from './centers-store';

// ===== AUTH STORE =====
// For authentication state only

export { useAuthStore } from './auth-store';

// ===== USER STORE =====
// For complete user data (profile, roles, rentals) - now using Zustand

export {
  useUserStore,
  useUserProfile,
  useUserRoles,
  useUserManagedCenter,
  useUserManagedCenterData,
  useUserActiveRentals,
  useIsCoordinator,
  useIsSuperCoordinator,
  useIsAdmin,
  useHasPrivilegedRole,
  useUserRentalsByStatus,
  useUserRentalCounts
} from './user-store';
export { 
  useRentalsStore, 
  useFilteredUserRentals,
  useRentalCounts,
  useCanCancelRental 
} from './rentals-store';

// ===== COORDINATOR STORES =====
// For center coordinator operations

export { 
  useCoordinatorStore,
  useFilteredCoordinatorRentals,
  useCoordinatorRentalCounts
} from './coordinator-store';

// ===== ADMIN STORES =====
// For system administrator operations

export {
  useAdminUsersStore,
  useAdminCentersStore,
  useAdminGamesStore,
  useAdminStatsStore
} from './admin';

// ===== STORE TYPES =====
// Re-export store type interfaces for component props

export type { AuthStore } from './auth-store';
// Games store doesn't export type anymore - using inline type
// Centers store doesn't export type anymore - using inline type
export type { RentalsStore } from './rentals-store';
export type { CoordinatorStore } from './coordinator-store';
export type {
  AdminUsersStore,
  AdminCentersStore,
  AdminGamesStore,
  AdminStatsStore
} from './admin';
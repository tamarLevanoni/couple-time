// API Request Types - Input contracts for endpoints
// Response types use ApiResponse<T> from @/lib/api-response

import type { User, Center, Game, Rental, Area } from './schema';

// ===== FILTERS =====

export interface GameFilters {
  search?: string;
  category?: string;
  targetAudience?: string;
  centerId?: string;
}

export interface CenterFilters {
  search?: string;
  area?: string;
  city?: string;
}

export interface RentalFilters {
  status?: string;
  centerId?: string;
  userId?: string;
}

// ===== REQUEST TYPES =====

// User requests
export type UpdateUserProfileRequest = Partial<Pick<User, 'name' | 'phone'>>;

// Game requests  
export interface GameCatalogRequest {
  centerId?: string;
  filters?: GameFilters;
}

export type CreateGameRequest = Pick<Game, 'name' | 'category' | 'targetAudience'> & 
  Partial<Pick<Game, 'description' | 'imageUrl'>>;

// Center requests
export interface CenterListRequest {
  filters?: CenterFilters;
}

export type CreateCenterRequest = Pick<Center, 'name' | 'city' | 'area'> & 
  Partial<Pick<Center, 'coordinatorId' | 'superCoordinatorId' | 'location'>>;

export type UpdateCenterRequest = Partial<Pick<Center, 
  'name' | 'city' | 'area' | 'coordinatorId' | 'superCoordinatorId' | 'location' | 'isActive'>>;

// Rental requests
export interface CreateRentalRequest {
  gameInstanceIds: string[];
  notes?: string;
}

export type UpdateRentalRequest = Partial<Pick<Rental, 'status'>>;

export interface RentalListRequest {
  filters?: RentalFilters;
}

// Coordinator requests
export type AddGameToCenterRequest = {
  gameId: string;
};

// Admin requests
export type UpdateUserRequest = Partial<Pick<User, 
  'name' | 'phone' | 'roles' | 'isActive' | 'managedCenterId' | 'supervisedCenterIds'>>;

// ===== UTILITY TYPES =====

export interface IdParam {
  id: string;
}
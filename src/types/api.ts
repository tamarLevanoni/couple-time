// API Types - Request/Response interfaces for all endpoints
// Based on user stories and acceptance criteria

import {
  // Base types
  BaseUser,
  BaseCenter,
  BaseGame,
  BaseGameInstance,
  BaseRental,
  
  // Extended types
  UserWithRelations,
  CenterWithRelations,
  CenterWithStats,
  GameWithRelations,
  GameWithAvailability,
  GameInstanceWithRelations,
  GameInstanceWithDetails,
  RentalWithRelations,
  RentalWithDetails,
  
  // Enums
  Role,
  Area,
  GameCategory,
  TargetAudience,
  GameInstanceStatus,
  RentalStatus,
  
  // Filters
  UserFilters,
  CenterFilters,
  GameFilters,
  RentalFilters,
  
  // Additional types
  CoordinatorContact,
  ActivityEntry,
  CenterPerformance,
  PopularGame,
  SystemStats,
  OverdueRentalWithCenter,
  OverdueSummary,
} from './database';

// ===== COMMON API TYPES =====

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// ===== USER API TYPES =====

// User profile update - US-1.6
export type UpdateUserProfileRequest = Partial<Pick<BaseUser, 'name' | 'phone'>>;

export interface UserProfileResponse {
  user: UserWithRelations;
}

// User rentals - US-1.4
export interface UserRentalsResponse {
  pending: RentalWithDetails[];
  active: RentalWithDetails[];
  history: RentalWithDetails[];
}

// ===== GAME API TYPES =====

// Game catalog - US-1.1
export interface GameCatalogRequest {
  centerId?: string;
  filters?: GameFilters;
}

export interface GameCatalogResponse {
  games: GameWithAvailability[];
}

// Game details
export interface GameDetailsResponse {
  game: GameWithAvailability;
}

// Add new game - US-2.4
export type CreateGameRequest = Pick<BaseGame, 'name' | 'category' | 'targetAudience'> & 
  Partial<Pick<BaseGame, 'description' | 'imageUrl'>>;

export interface CreateGameResponse {
  game: BaseGame;
}

// ===== CENTER API TYPES =====

// Center list - US-1.2
export interface CenterListRequest {
  filters?: CenterFilters;
}

export interface CenterListResponse {
  centers: CenterWithRelations[];
}

// Center details with games
export interface CenterDetailsResponse {
  center: CenterWithStats;
  games: GameInstanceWithDetails[];
}

// Create center - US-4.2
export type CreateCenterRequest = Pick<BaseCenter, 'name' | 'city' | 'area'> & 
  Partial<Pick<BaseCenter, 'coordinatorId' | 'superCoordinatorId' | 'location'>>;

export interface CreateCenterResponse {
  center: BaseCenter;
}

// Update center - US-4.2
export type UpdateCenterRequest = Partial<Pick<BaseCenter, 
  'name' | 'city' | 'area' | 'coordinatorId' | 'superCoordinatorId' | 'location' | 'isActive'>>;

// ===== RENTAL API TYPES =====

// Create rental request - US-1.3
export type CreateRentalRequest = Pick<BaseRental, 'gameInstanceId'> & 
  Partial<Pick<BaseRental, 'notes'>>;

export interface CreateRentalResponse {
  rental: RentalWithDetails;
  coordinatorContact: CoordinatorContact;
}

// Manual rental creation - US-2.5
export type CreateManualRentalRequest = Pick<BaseRental, 'userId' | 'gameInstanceId'> & 
  Partial<Pick<BaseRental, 'expectedReturnDate' | 'notes'>>;

// Rental management - US-2.2, US-2.3
export type UpdateRentalRequest = Partial<Pick<BaseRental, 
  'status' | 'expectedReturnDate' | 'notes'>>;

export interface RentalListRequest {
  filters?: RentalFilters;
}

export interface RentalListResponse {
  rentals: RentalWithDetails[];
}

// ===== COORDINATOR API TYPES =====

// Coordinator dashboard - US-2.1, US-2.6
export type CoordinatorDashboardResponse = {
  centerStats: CenterWithStats;
  pendingRequests: RentalWithDetails[];
  activeRentals: RentalWithDetails[];
  overdueRentals: RentalWithDetails[];
  recentActivity: ActivityEntry[];
}

// Add game to center - US-2.4
export type AddGameToCenterRequest = {
  gameId: string;
}

export type AddGameToCenterResponse = {
  gameInstance: GameInstanceWithDetails;
}

// ===== SUPER COORDINATOR API TYPES =====

// Super coordinator dashboard - US-3.1
export interface SuperCoordinatorDashboardResponse {
  centers: CenterWithStats[];
  totalPendingRequests: number;
  totalActiveRentals: number;
  totalOverdueRentals: number;
  recentActivity: ActivityEntry[];
}

// Overdue report - US-3.3
export interface OverdueReportRequest {
  centerId?: string;
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
}

export interface OverdueReportResponse {
  overdueRentals: OverdueRentalWithCenter[];
  summary: OverdueSummary;
}

// ===== ADMIN API TYPES =====

// User management - US-4.1
export interface UserListRequest {
  filters?: UserFilters;
}

export interface UserListResponse {
  users: UserWithRelations[];
}

export type UpdateUserRequest = Partial<Pick<BaseUser, 
  'name' | 'phone' | 'roles' | 'isActive' | 'managedCenterIds' | 'supervisedCenterIds'>>;

// Admin dashboard - US-4.4
export interface AdminDashboardResponse {
  stats: SystemStats;
  recentActivity: ActivityEntry[];
  popularGames: PopularGame[];
  centerPerformance: CenterPerformance[];
}

// Reports - US-4.4
export interface ReportRequest {
  type: 'rentals' | 'games' | 'centers' | 'coordinators';
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
  centerId?: string;
  area?: Area;
  format?: 'json' | 'csv' | 'excel';
}

export interface ReportResponse {
  data: any[];
  summary: {
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    filters: Record<string, any>;
  };
  downloadUrl?: string; // For CSV/Excel exports
}


// ===== UTILITY TYPES =====

// Common ID parameter
export interface IdParam {
  id: string;
}

// Bulk operations
export interface BulkUpdateRequest<T> {
  items: {
    id: string;
    data: T;
  }[];
}

export interface BulkUpdateResponse {
  success: number;
  failed: number;
  errors: {
    id: string;
    error: string;
  }[];
}

// File upload
export interface FileUploadRequest {
  file: File;
  type: 'game_image' | 'center_image' | 'document';
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
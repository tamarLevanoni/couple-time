// API Types - Request/Response interfaces for all endpoints
// Based on user stories and acceptance criteria

import { 
  User, 
  Center, 
  Game, 
  GameInstance, 
  Rental,
  Role,
  Area,
  GameCategory,
  TargetAudience,
  RentalStatus,
  GameInstanceStatus,
  UserFilters,
  CenterFilters,
  GameFilters,
  RentalFilters,
  GameWithAvailability,
  CenterWithStats,
  RentalWithDetails
} from './database';

// ===== STANDARD API RESPONSE WRAPPER =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== AUTH API TYPES =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

// ===== USER API TYPES =====
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  defaultDashboard?: string;
}

export interface UserSearchRequest {
  query: string; // searches name, email, phone
  limit?: number;
}

export interface UserManagementRequest {
  userId: string;
  action: 'block' | 'unblock' | 'updateRoles' | 'assignCenter' | 'removeCenter';
  data?: {
    roles?: Role[];
    centerId?: string;
    isActive?: boolean;
  };
}

export interface UsersListRequest {
  filters: UserFilters;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export type UsersListResponse = PaginatedResponse<User>;

// ===== CENTER API TYPES =====
export interface CreateCenterRequest {
  name: string;
  city: string;
  area: Area;
  coordinatorId?: string;
  superCoordinatorId?: string;
  location?: { lat: number; lng: number };
}

export interface UpdateCenterRequest {
  name?: string;
  city?: string;
  area?: Area;
  coordinatorId?: string;
  superCoordinatorId?: string;
  location?: { lat: number; lng: number };
  isActive?: boolean;
}

export interface CentersListRequest {
  filters: CenterFilters;
  includeStats?: boolean;
  page?: number;
  limit?: number;
}

export type CentersListResponse = PaginatedResponse<Center | CenterWithStats>;

export interface CenterStatsResponse {
  totalGames: number;
  availableGames: number;
  pendingRequests: number;
  activeRentals: number;
  overdueRentals: number;
  popularGames: {
    gameId: string;
    gameName: string;
    rentalCount: number;
  }[];
  delayPercentage: number;
  coordinator?: User;
  superCoordinator?: User;
}

// ===== GAME API TYPES =====
export interface CreateGameRequest {
  name: string;
  description?: string;
  category: GameCategory;
  targetAudience: TargetAudience;
  imageUrl?: string;
  addToCenterId?: string; // automatically add to center
}

export interface UpdateGameRequest {
  name?: string;
  description?: string;
  category?: GameCategory;
  targetAudience?: TargetAudience;
  imageUrl?: string;
}

export interface GamesListRequest {
  filters: GameFilters;
  includeAvailability?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export type GamesListResponse = PaginatedResponse<Game | GameWithAvailability>;

export interface GameAvailabilityResponse {
  gameId: string;
  totalCenters: number;
  availableCount: number;
  borrowedCount: number;
  centers: {
    centerId: string;
    centerName: string;
    city: string;
    area: Area;
    availableCount: number;
    status: GameInstanceStatus;
  }[];
}

// ===== GAME INSTANCE API TYPES =====
export interface AddGameToCenterRequest {
  gameId: string;
  centerId: string;
  notes?: string;
}

export interface UpdateGameInstanceRequest {
  status?: GameInstanceStatus;
  notes?: string;
  expectedReturnDate?: Date;
}

export interface CenterGamesResponse {
  centerId: string;
  centerName: string;
  games: {
    gameInstanceId: string;
    game: Game;
    status: GameInstanceStatus;
    expectedReturnDate: Date | null;
    currentRental?: Rental | null;
  }[];
}

// ===== RENTAL API TYPES =====
export interface CreateRentalRequest {
  gameInstanceId: string;
  notes?: string;
  expectedReturnDate?: Date;
}

export interface GuestRentalRequest {
  gameInstanceId: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface UpdateRentalRequest {
  status?: RentalStatus;
  notes?: string;
  rejectionReason?: string;
  expectedReturnDate?: Date;
  borrowDate?: Date;
  returnDate?: Date;
}

export interface ManualRentalRequest {
  userId: string;
  gameInstanceId: string;
  notes?: string;
  expectedReturnDate?: Date;
  // Creates rental directly in ACTIVE status
}

export interface RentalsListRequest {
  filters: RentalFilters;
  includeDetails?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'requestDate' | 'expectedReturnDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export type RentalsListResponse = PaginatedResponse<Rental | RentalWithDetails>;

export interface RentalActionRequest {
  rentalId: string;
  action: 'approve' | 'reject' | 'cancel' | 'return';
  data?: {
    expectedReturnDate?: Date;
    rejectionReason?: string;
    notes?: string;
  };
}

// ===== COORDINATOR DASHBOARD API TYPES =====
export interface CoordinatorDashboardRequest {
  centerId: string;
  dateRange?: { start: Date; end: Date };
}

export interface CoordinatorDashboardResponse {
  center: CenterWithStats;
  pendingRequests: RentalWithDetails[];
  activeRentals: RentalWithDetails[];
  overdueRentals: RentalWithDetails[];
  recentActivity: {
    type: 'rental_request' | 'rental_approved' | 'rental_returned';
    rental: RentalWithDetails;
    timestamp: Date;
  }[];
}

// ===== SUPER COORDINATOR API TYPES =====
export interface SuperCoordinatorDashboardRequest {
  dateRange?: { start: Date; end: Date };
}

export interface SuperCoordinatorDashboardResponse {
  supervisedCenters: CenterWithStats[];
  allPendingRequests: RentalWithDetails[];
  allOverdueRentals: RentalWithDetails[];
  coordinators: User[];
}

export interface OverdueReportRequest {
  centerId?: string;
  dateRange?: { start: Date; end: Date };
}

export interface OverdueReportResponse {
  overdueRentals: RentalWithDetails[];
  summary: {
    total: number;
    byCenter: { [centerId: string]: number };
    byTimeRange: {
      '1-3days': number;
      '4-7days': number;
      '1-2weeks': number;
      'over2weeks': number;
    };
  };
}

// ===== ADMIN API TYPES =====
export interface AdminDashboardResponse {
  systemStats: {
    totalUsers: number;
    totalCenters: number;
    totalGames: number;
    totalRentals: number;
    activeRentals: number;
    overdueRentals: number;
  };
  recentActivity: {
    type: 'user_registered' | 'center_created' | 'game_added' | 'rental_created';
    description: string;
    timestamp: Date;
  }[];
  topCenters: CenterWithStats[];
  topGames: GameWithAvailability[];
}

export interface ReportRequest {
  type: 'rentals' | 'games' | 'centers' | 'users';
  filters?: {
    dateRange?: { start: Date; end: Date };
    centerId?: string;
    area?: Area;
    category?: GameCategory;
  };
  format?: 'json' | 'csv' | 'excel';
}

export interface ReportResponse {
  type: string;
  data: any[];
  summary?: any;
  generatedAt: Date;
  downloadUrl?: string; // for CSV/Excel exports
}

// ===== NOTIFICATION API TYPES =====
export interface NotificationRequest {
  type: 'rental_request' | 'rental_approved' | 'rental_reminder' | 'overdue_alert';
  recipientId: string;
  data: {
    rental?: Rental;
    message?: string;
    whatsappMessage?: string;
  };
}

export interface WhatsAppLinkRequest {
  phone: string;
  message: string;
  fallbackSMS?: boolean;
}

export interface WhatsAppLinkResponse {
  whatsappUrl: string;
  smsUrl?: string;
  callUrl: string;
}

// ===== FEEDBACK API TYPES =====
export interface FeedbackRequest {
  gameId: string;
  centerId: string;
  rating: number; // 1-5
  comments?: string;
  // Anonymous - no user ID
}

export interface FeedbackResponse {
  gameId: string;
  averageRating: number;
  totalReviews: number;
  reviews: {
    rating: number;
    comments: string | null;
    createdAt: Date;
  }[];
}

// ===== SEARCH API TYPES =====
export interface GlobalSearchRequest {
  query: string;
  types?: ('games' | 'centers' | 'users')[];
  limit?: number;
}

export interface GlobalSearchResponse {
  games: Game[];
  centers: Center[];
  users: User[];
  total: number;
}

// ===== UTILITY API TYPES =====
export interface UploadRequest {
  file: File;
  type: 'game_image' | 'center_image' | 'user_avatar';
}

export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

// Type guards for API responses
export function isApiError(response: any): response is ApiErrorResponse {
  return response && response.success === false && response.error;
}

export function isApiSuccess<T>(response: any): response is ApiResponse<T> {
  return response && response.success === true;
}
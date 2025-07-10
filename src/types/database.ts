// Database Model Types - Matches Prisma Schema exactly
// Source: /prisma/schema.prisma

import {
  User as PrismaUser,
  Center as PrismaCenter,
  Game as PrismaGame,
  GameInstance as PrismaGameInstance,
  Rental as PrismaRental,
  Role,
  Area,
  GameCategory,
  TargetAudience,
  GameInstanceStatus,
  RentalStatus,
  } from '@prisma/client';
  
  // ===== USER TYPES =====
  // Base user model from Prisma - use for DB operations
  export type BaseUser = PrismaUser;
  
  // User with populated relations - use for detailed views, profiles
  export interface UserWithRelations extends BaseUser {
  managedCenters?: CenterWithRelations[];
  supervisedCenters?: CenterWithRelations[];
  rentals?: RentalWithRelations[];
  }
  
  // ===== CENTER TYPES =====
  // Base center model from Prisma - use for DB operations
  export type BaseCenter = PrismaCenter;
  
  // Center with populated relations - use for center management, listings
  export interface CenterWithRelations extends BaseCenter {
  coordinator?: UserWithRelations | null;
  superCoordinator?: UserWithRelations | null;
  gameInstances?: GameInstanceWithRelations[];
  }
  
  // Center with basic coordinator info - use for lightweight coordinator display
  export interface CenterWithCoordinatorInfo extends BaseCenter {
  coordinator?: BaseUser | null;
  }
  
  // Center with computed statistics - use for dashboards, analytics
  export interface CenterWithStats extends CenterWithRelations {
  totalGames: number;
  availableGames: number;
  pendingRequests: number;
  activeRentals: number;
  overdueRentals: number;
  }
  
  // ===== GAME TYPES =====
  // Base game model from Prisma - use for DB operations
  export type BaseGame = PrismaGame;
  
  // Game with populated relations - use for game details, management
  export interface GameWithRelations extends BaseGame {
  gameInstances?: GameInstanceWithRelations[];
  }
  
  // Game with availability across centers - use for game catalog, search
  export interface GameWithAvailability extends GameWithRelations {
  totalCenters: number;
  availableCount: number;
  borrowedCount: number;
  availableCenters: {
    centerId: string;
    centerName: string;
    city: string;
    area: Area;
    availableCount: number;
  }[];
  }
  
  // ===== GAME INSTANCE TYPES ===
  // Base game instance model from Prisma - use for DB operations
  export type BaseGameInstance = PrismaGameInstance;
  
  // Game instance with populated relations - use for inventory management
  export interface GameInstanceWithRelations extends BaseGameInstance {
  game?: GameWithRelations;
  center?: CenterWithRelations;
  rentals?: RentalWithRelations[];
  }
  
  // Game instance with computed status - use for rental operations, status checks
  export interface GameInstanceWithDetails extends BaseGameInstance {
  game: BaseGame;
  center: CenterWithCoordinatorInfo;
  currentRental?: RentalWithRelations | null;
  isOverdue: boolean;
  }
  
  // ===== RENTAL TYPES =====
  // Base rental model from Prisma - use for DB operations
  export type BaseRental = PrismaRental;
  
  // Rental with populated relations - use for rental listings, history
  export interface RentalWithRelations extends BaseRental {
  user?: UserWithRelations;
  gameInstance?: GameInstanceWithRelations;
  }
  
  // Rental with computed business logic - use for rental management, UI actions
  export interface RentalWithDetails extends RentalWithRelations {
  isOverdue: boolean;
  daysOverdue: number;
  canCancel: boolean;
  canReturn: boolean;
}

// ===== ENUM EXPORTS =====
export {
  Role,
  Area,
  GameCategory,
  TargetAudience,
  GameInstanceStatus,
  RentalStatus,
  };
  
  // ===== UTILITY TYPES =====
  // Union of all base database models - use for generic operations
  export type DatabaseModel =
  | BaseUser
  | BaseCenter
  | BaseGame
  | BaseGameInstance
  | BaseRental;
  
  // Helper types for common patterns
  export type WithId<T> = T & { id: string };
  export type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
  export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
  
  // ===== FILTER TYPES =====
  // User filtering - use for admin user management, search
  export type UserFilters = {
  roles?: Role[];
  isActive?: boolean;
  search?: string; // searches name, email, phone
  centerId?: string; // users associated with center
};

// Center filtering - use for center listings, location search
export type CenterFilters = {
  area?: Area;
  city?: string;
  isActive?: boolean;
  hasCoordinator?: boolean;
  search?: string; // searches name, city
};

// Game filtering - use for game catalog, availability search
export type GameFilters = {
  category?: GameCategory;
  targetAudience?: TargetAudience;
  centerId?: string; // games available at center
  status?: GameInstanceStatus; // filter by availability
  search?: string; // searches name, description
};

// Rental filtering - use for rental history, reports, management
export type RentalFilters = {
  userId?: string;
  centerId?: string;
  status?: RentalStatus;
  overdue?: boolean;
  dateRange?: { start: Date; end: Date };
};

// ===== ADDITIONAL TYPES FOR API =====

// Coordinator contact information
export interface CoordinatorContact {
  name: string;
  phone: string;
  whatsappLink: string;
}

// Activity log entry
export interface ActivityEntry {
  type: 'rental_request' | 'rental_approved' | 'rental_returned' | 'user_registered';
  description: string;
  timestamp: string;
  rental?: RentalWithDetails;
  centerId?: string;
  centerName?: string;
}

// Statistics and reports
export interface CenterPerformance {
  centerId: string;
  centerName: string;
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  avgReturnTime: number; // days
}

export interface PopularGame {
  gameId: string;
  gameName: string;
  rentalCount: number;
}

export interface SystemStats {
  totalUsers: number;
  totalCenters: number;
  totalGames: number;
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
}

// Overdue rental with extended info
export interface OverdueRentalWithCenter extends RentalWithDetails {
  daysOverdue: number;
  centerName: string;
}

// Overdue summary
export interface OverdueSummary {
  totalOverdue: number;
  byCenter: {
    centerId: string;
    centerName: string;
    count: number;
  }[];
}


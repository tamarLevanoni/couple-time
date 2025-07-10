// Database Model Types - Matches Prisma Schema exactly
// Generated from /prisma/schema.prisma

import { 
  Role, 
  Area, 
  GameCategory, 
  TargetAudience, 
  GameInstanceStatus, 
  RentalStatus 
} from '@prisma/client';

// ===== USER TYPES =====
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  managedCenterIds: string[];
  supervisedCenterIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Authentication fields
  googleId: string | null;
  password: string | null;
  image: string | null;
  
  // Relations (when populated)
  managedCenters?: Center[];
  supervisedCenters?: Center[];
  rentals?: Rental[];
}

// User with specific role context
export interface UserWithRole extends User {
  currentRole: Role;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  canManageCenter: (centerId: string) => boolean;
  canSuperviseCenter: (centerId: string) => boolean;
}

// ===== CENTER TYPES =====
export interface Center {
  id: string;
  name: string;
  city: string;
  area: Area;
  coordinatorId: string | null;
  superCoordinatorId: string | null;
  location: { lat: number; lng: number } | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (when populated)
  coordinator?: User | null;
  superCoordinator?: User | null;
  gameInstances?: GameInstance[];
}

// Center with computed fields
export interface CenterWithStats extends Center {
  totalGames: number;
  availableGames: number;
  pendingRequests: number;
  activeRentals: number;
  overdueRentals: number;
}

// ===== GAME TYPES =====
export interface Game {
  id: string;
  name: string;
  description: string | null;
  category: GameCategory;
  targetAudience: TargetAudience;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (when populated)
  gameInstances?: GameInstance[];
}

// Game with availability info
export interface GameWithAvailability extends Game {
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

// ===== GAME INSTANCE TYPES =====
export interface GameInstance {
  id: string;
  gameId: string;
  centerId: string;
  status: GameInstanceStatus;
  expectedReturnDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (when populated)
  game?: Game;
  center?: Center;
  rentals?: Rental[];
}

// Game instance with full details
export interface GameInstanceWithDetails extends GameInstance {
  game: Game;
  center: Center;
  currentRental?: Rental | null;
  isOverdue: boolean;
}

// ===== RENTAL TYPES =====
export interface Rental {
  id: string;
  userId: string;
  gameInstanceId: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate: Date | null;
  returnDate: Date | null;
  expectedReturnDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (when populated)
  user?: User;
  gameInstance?: GameInstance;
}

// Rental with full details
export interface RentalWithDetails extends Rental {
  user: User;
  gameInstance: GameInstanceWithDetails;
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
  RentalStatus
};

// ===== UTILITY TYPES =====
export type DatabaseModel = User | Center | Game | GameInstance | Rental;
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Filter types for database queries
export type UserFilters = {
  roles?: Role[];
  isActive?: boolean;
  search?: string; // searches name, email, phone
  centerId?: string; // users associated with center
};

export type CenterFilters = {
  area?: Area;
  city?: string;
  isActive?: boolean;
  hasCoordinator?: boolean;
  search?: string; // searches name, city
};

export type GameFilters = {
  category?: GameCategory;
  targetAudience?: TargetAudience;
  centerId?: string; // games available at center
  status?: GameInstanceStatus; // filter by availability
  search?: string; // searches name, description
};

export type RentalFilters = {
  userId?: string;
  centerId?: string;
  status?: RentalStatus;
  overdue?: boolean;
  dateRange?: { start: Date; end: Date };
};
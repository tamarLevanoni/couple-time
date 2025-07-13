// Business logic types - practical interfaces for different contexts
import type { 
  RentalForUser, 
  RentalForCoordinator, 
  CenterWithCoordinator, 
  GameBasic, 
  CenterBasic,
  UserContact,
  GameInstanceForCoordinator,
  CenterPublicInfo
} from './models';
import type { Game, Center, Area, Role, GameInstanceStatus, RentalStatus, GameCategory, TargetAudience } from './schema';

// ===== COMPUTED FIELD TYPES =====
// These add computed fields to base types for enhanced functionality

export interface RentalWithDetails extends RentalForUser {
  isOverdue: boolean; // Computed: true if past expected return date
  canCancel: boolean; // Computed: true if rental can be cancelled by user
  daysOverdue: number; // Computed: number of days past expected return date
}

export interface CenterWithStats extends CenterWithCoordinator {
  totalGames: number; // Computed: total game instances in center
  availableGames: number; // Computed: number of available game instances
  activeRentals: number; // Computed: number of currently active rentals
  overdueRentals: number; // Computed: number of overdue rentals
}

// ===== DASHBOARD RESPONSES =====
// Keep dashboard types simple and focused

// ===== ANALYTICS =====
// Simple stats - compute on demand, don't over-engineer

export interface SystemStats {
  totalUsers: number;
  totalCenters: number; 
  totalGames: number;
  activeRentals: number;
}

// ===== API SPECIFICATION TYPES =====
// Types that match exactly what's documented in api-routes-documentation.md

// Note: Public types (GamePublicInfo, CenterPublicInfo) are available from models.ts

export interface UserProfileWithRentals {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  isActive: boolean;
  currentRentals: RentalForUser[];
}

// Coordinator Dashboard Response - Simple and focused
export interface CoordinatorDashboard {
  center: CenterBasic;
  superCoordinator?: UserContact;
  pendingRentals: RentalForCoordinator[];
  activeRentals: RentalForCoordinator[];
}

export interface CenterStats {
  totalRentals: number;
  activeRentals: number;
  returnedRentals: number;
  overdueRentals: number;
  totalGames: number;
  availableGames: number;
  popularGames: { gameId: string; gameName: string; rentalCount: number }[];
  overduePercentage: number;
  averageRentalDays: number;
}

// Super Coordinator Types
export interface CenterForSuperCoordinator extends CenterBasic {
  area: Area;
  isActive: boolean;
  coordinator?: UserContact;
  stats: { totalGames: number; pendingRentals: number; activeRentals: number; overdueRentals: number };
}

export interface RentalForSuperCoordinator {
  id: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  user: { id: string; name: string; phone: string; email: string };
  center: { id: string; name: string; city: string };
  gameInstances: { id: string; gameId: string; game: { id: string; name: string } }[];
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
}

// Admin Types
export interface UserForAdmin extends UserContact {
  roles: Role[];
  isActive: boolean;
  managedCenter?: CenterBasic;
  supervisedCenters: CenterBasic[];
  createdAt: Date;
}

export interface CenterForAdmin extends CenterBasic {
  area: Area;
  isActive: boolean;
  coordinator?: UserContact;
  superCoordinator?: UserContact;
  stats: { totalGames: number; activeRentals: number; totalRentals: number };
  createdAt: Date;
}

export interface GameForAdmin extends GameBasic {
  totalInstances: number;
  availableInstances: number;
  centerDistribution: { centerId: string; centerName: string; instances: number }[];
  createdAt: Date;
}

export interface RentalForAdmin {
  id: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  user: { id: string; name: string; phone: string; email: string };
  center: { id: string; name: string; city: string; area: Area };
  gameInstances: { id: string; game: { id: string; name: string } }[];
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
}
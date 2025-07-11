// Business logic types - practical interfaces for different contexts
import type { RentalForUser, RentalForCoordinator, CenterWithCoordinator, GameBasic, CenterBasic } from './models';
import type { Game, Center } from './schema';

// ===== ENHANCED RENTAL TYPES =====

export interface RentalWithDetails extends RentalForUser {
  isOverdue: boolean; // Computed: true if past expected return date
  canCancel: boolean; // Computed: true if rental can be cancelled by user
  daysOverdue: number; // Computed: number of days past expected return date
}

export interface RentalWithStatus extends RentalForCoordinator {
  isOverdue: boolean; // Computed: true if past expected return date
  canCancel: boolean; // Computed: true if rental can be cancelled
  canReturn: boolean; // Computed: true if rental can be returned
  daysOverdue: number; // Computed: number of days past expected return date
}

// ===== ENHANCED CENTER TYPES =====

export interface CenterWithStats extends CenterWithCoordinator {
  totalGames: number; // Computed: total game instances in center
  availableGames: number; // Computed: number of available game instances
  pendingRequests: number; // Computed: number of pending rental requests
  activeRentals: number; // Computed: number of currently active rentals
  overdueRentals: number; // Computed: number of overdue rentals
}

// ===== GAME AVAILABILITY =====

export interface CenterGameAvailability extends CenterBasic {
  availableCount: number; // Available instances of this specific game in this center
}

export interface GameWithAvailability extends GameBasic {
  totalCenters: number; // Computed: total centers that have this game
  availableCount: number; // Computed: total available instances across all centers
  availableCenters: CenterGameAvailability[]; // Computed: centers where this game is available
}

// ===== DASHBOARD RESPONSES =====

export interface UserDashboard {
  pending: RentalWithDetails[]; // User's pending rental requests
  active: RentalWithDetails[]; // User's currently active rentals
  history: RentalWithDetails[]; // User's completed rental history
}

export interface CoordinatorDashboard {
  centerStats: CenterWithStats; // Center statistics and info
  pendingRequests: RentalWithStatus[]; // Pending rental requests for center
  activeRentals: RentalWithStatus[]; // Currently active rentals in center
  overdueRentals: RentalWithStatus[]; // Overdue rentals in center
  recentActivity: ActivityEntry[]; // Recent activity log for center
}

// ===== ANALYTICS =====

export interface SystemStats {
  totalUsers: number; // Total registered users in system
  totalCenters: number; // Total active centers in system
  totalGames: number; // Total unique games in system
  totalRentals: number; // Total rental requests ever made
  activeRentals: number; // Currently active rentals across system
  overdueRentals: number; // Currently overdue rentals across system
}

export interface PopularGame extends Pick<Game, 'id' | 'name'> {
  rentalCount: number; // Total number of times this game was rented
}

export interface CenterPerformance extends Pick<Center, 'id' | 'name'> {
  totalRentals: number; // Total rentals processed by center
  activeRentals: number; // Currently active rentals in center
  overdueRentals: number; // Currently overdue rentals in center
  avgReturnTime: number; // Average return time in days
}

// ===== ACTIVITY TRACKING =====

export interface ActivityEntry {
  type: 'rental_request' | 'rental_approved' | 'rental_returned' | 'user_registered'; // Type of activity
  description: string; // Human-readable description of activity
  timestamp: string; // ISO timestamp when activity occurred
  centerId?: string; // Optional: center where activity occurred
  centerName?: string; // Optional: center name for display
}
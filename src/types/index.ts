// Central exports - organized by domain
//
// This file exports all types from our layered type architecture:
// - schema.ts: Base Prisma types and enums 
// - models.ts: Query objects and generated database types
// - computed.ts: Business logic enhancements and API specification types
//
// Usage in API routes:
// import { CreateRentalInput, RENTAL_FOR_USER, RentalForUser } from '@/types';
//
// Usage in components:
// import { UserContact, GameForPublic, CoordinatorDashboard } from '@/types';

// ===== BASE SCHEMA TYPES =====
// User, Center, Game, GameInstance, Rental
// Role, Area, GameCategory, TargetAudience, GameInstanceStatus, RentalStatus
export * from './schema';

// ===== DATA MODELS =====
// Query objects: USER_CONTACT_FIELDS, GAMES_PUBLIC_INFO, COORDINATOR_DASHBOARD, etc.
// Generated types: UserContact, GameBasic, RentalForUser, CenterWithCoordinator, etc.
export * from './models';

// ===== BUSINESS LOGIC TYPES =====
// API specification types: GameForPublic, UserProfileWithRentals, CoordinatorDashboard, etc.
// Enhanced computed types: RentalWithDetails, CenterWithStats, SystemStats, etc.
export * from './computed';

// ===== VALIDATION SCHEMAS =====
// Import validation schemas directly from @/lib/validations when needed
// Removed re-export to avoid circular dependencies

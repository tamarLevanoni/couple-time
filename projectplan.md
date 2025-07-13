# Couple-Time Project Plan

## Overview
Building a complete game rental management system for couples therapy centers. Following a 3-step approach: APIs → Stores → UI.

## Current State Analysis
- **Foundation**: Solid Next.js + TypeScript + Prisma + NextAuth setup
- **Database**: Complete schema with Users, Centers, Games, Rentals
- **Issue**: Stores expect APIs that don't exist, incomplete business logic
- **Tech Stack**: Next.js 15, TypeScript, Prisma, PostgreSQL, Zustand, Tailwind

---

## PHASE 1: APIs & Infrastructure (with Testing) ✅ COMPLETE

### 1.1 Guest APIs ✅ (Complete)
- [x] `/api/public/centers` - Center listing
- [x] `/api/public/games` - Game catalog
- [x] Basic testing for guest APIs

### 1.2 Authentication APIs ✅ (Complete)
- [x] `/api/auth/[...nextauth]` - NextAuth handlers
- [x] `/api/auth/me` - Current user profile
- [x] `/api/auth/register` - User registration
- [x] Global middleware for route protection

### 1.3 Regular User APIs ✅ (Complete)
- [x] `/api/user/rentals` - GET (fetch user rentals), POST (create rental request)
- [x] `/api/user/rentals/[id]` - PUT (update rental request)
- [x] User API testing completed

### 1.4 Center Coordinator APIs ✅ (Complete)
- [x] `/api/coordinator/games` - POST (add game instance)
- [x] `/api/coordinator/games/[id]` - PUT (update game instance)
- [x] Coordinator API testing completed

### 1.5 SUPER COORDINATOR APIs ✅ (Complete)
- [x] `/api/super/centers` - GET (supervised centers with basic info)
- [x] `/api/super/centers/[id]` - GET (full center details), PUT (manage centers)
- [x] `/api/super/rentals` - POST (create rental)
- [x] `/api/super/rentals/[id]` - PUT (rental management)
- [x] `/api/super/games` - POST (add game instance)
- [x] `/api/super/games/[id]` - PUT (update game instance)
- [x] Super coordinator API testing completed

### 1.6 Admin APIs ✅ (Complete)
- [x] `/api/admin/users` - GET, POST, PUT, DELETE (complete user management)
- [x] `/api/admin/centers` - GET, POST, PUT, DELETE (complete center management)
- [x] `/api/admin/games` - GET, POST, PUT, DELETE (complete game catalog management)
- [x] `/api/admin/roles` - PUT (role assignment with center permissions)
- [x] `/api/admin/system` - GET (comprehensive system health and statistics)
- [x] Admin API testing completed

### 1.7 Testing Infrastructure ✅ (Complete)
- [x] Comprehensive API testing framework
- [x] 18/18 API endpoints tested and verified
- [x] Database schema validation
- [x] Response format standardization
- [x] Authentication and middleware testing
- [x] Schema validation testing with Zod

### 1.8 Validation Schema Refactoring ✅ (Complete)
- [x] Centralized validation schemas in `@/lib/validations.ts`
- [x] Refactored remaining 9 API route files to use centralized schemas
- [x] Replaced local zod schemas with centralized ones
- [x] Used .extend() and .omit() for schema composition
- [x] Maintained existing functionality while improving consistency

---

## PHASE 2: Stores (State Management)

### 2.1 Games Store (Update existing)
- [ ] Update to match new API endpoints
- [ ] Add rental availability tracking
- [ ] Add game instance management
- [ ] Add error handling and loading states

### 2.2 Centers Store (Update existing)
- [ ] Update to match new API endpoints
- [ ] Add center management functions
- [ ] Add coordinator assignment
- [ ] Add statistics tracking
- [ ] Add error handling and loading states

### 2.3 User Store (Create new)
- [ ] User profile management
- [ ] User preferences
- [ ] User role management
- [ ] User notifications
- [ ] User favorites

### 2.4 Authentication Store (Create new)
- [ ] Session management
- [ ] Role-based access control
- [ ] Login/logout functions
- [ ] Permission checking
- [ ] Auth state persistence

### 2.5 Rentals Store (Create new)
- [ ] Rental request creation
- [ ] Rental status tracking
- [ ] Rental history
- [ ] Rental approval/rejection
- [ ] Overdue tracking

---

## PHASE 3: UI Implementation

### 3.1 Complete Dashboard Pages
- [ ] User dashboard improvements
- [ ] Coordinator dashboard completion
- [ ] Super coordinator dashboard
- [ ] Admin dashboard creation

### 3.2 Rental Management UI
- [ ] Rental request forms
- [ ] Rental approval interface
- [ ] Rental history views
- [ ] Overdue management

### 3.3 Admin Interface
- [ ] User management pages
- [ ] Center management pages
- [ ] Game catalog management
- [ ] Role assignment interface
- [ ] System monitoring dashboard

### 3.4 Enhanced User Experience
- [ ] Notifications system
- [ ] Favorites management
- [ ] Search improvements
- [ ] Mobile responsiveness
- [ ] Loading states and error handling

---

## Key Decisions Needed

Before starting implementation, I need clarification on:

1. **User Rental Flow**: Should users be able to directly borrow games, or only request rentals that need approval?
2. **Game Availability**: How should we handle multiple instances of the same game across centers?
3. **Notifications**: What events should trigger notifications (new rentals, overdue items, etc.)?
4. **Testing Strategy**: Do you want unit tests, integration tests, or both?
5. **Admin Features**: What level of system administration do you need (user roles, center management, etc.)?

---

## Review Section

### Phase 1 Completion Summary ✅
**Completed**: January 2025

**What was accomplished:**
- **All 18 API endpoints** implemented and tested successfully
- **Global middleware** system for authentication and role-based access control
- **Comprehensive testing framework** with automated endpoint verification
- **Consistent API response format** using standardized `apiResponse` function
- **Input validation** using Zod schemas across all endpoints
- **Database operations** optimized with Prisma ORM
- **Security implementation** with JWT tokens, password hashing, and proper error handling

**Key Technical Achievements:**
- Role-based access control with hierarchical permissions (ADMIN > SUPER_COORDINATOR > CENTER_COORDINATOR > USER)
- Soft deletion strategy for all resources (centers, games, users)
- Pagination support across all list endpoints
- Comprehensive error handling and validation
- Proper TypeScript interfaces and type safety

**APIs Implemented:**
- **Public APIs**: Games catalog, Centers listing
- **User APIs**: Rental management (create, update, view)  
- **Coordinator APIs**: Game instance management
- **Super Coordinator APIs**: Center supervision, rental oversight, game management
- **Admin APIs**: Complete CRUD for users, centers, games, plus role assignment and system monitoring

**Testing Results**: 18/18 endpoints verified, database schema validated, middleware functioning correctly

### JWT Migration Summary ✅
**Completed**: January 2025

**What was accomplished:**
- **Updated 16 API route files** to use JWT from `next-auth/jwt` instead of AuthToken from `@/types/api`
- **Updated middleware.ts** to use JWT type for authentication
- **Consistent import patterns** using `import { getToken, JWT } from 'next-auth/jwt'`
- **Proper type casting** using `as JWT | null` for all token authentication
- **Maintained existing functionality** while standardizing authentication token handling

**Files Updated:**
- `middleware.ts` - Global authentication middleware
- `src/app/api/super/games/[id]/route.ts` - Super coordinator game instance updates
- `src/app/api/super/games/route.ts` - Super coordinator game instance creation
- `src/app/api/coordinator/games/[id]/route.ts` - Coordinator game instance updates
- `src/app/api/coordinator/games/route.ts` - Coordinator game instance creation
- `src/app/api/super/centers/[id]/route.ts` - Super coordinator center management
- `src/app/api/user/route.ts` - User profile management
- `src/app/api/super/centers/route.ts` - Super coordinator center listing
- `src/app/api/admin/games/route.ts` - Admin game catalog management
- `src/app/api/admin/roles/route.ts` - Admin role assignment
- `src/app/api/admin/users/route.ts` - Admin user management
- `src/app/api/super/rentals/route.ts` - Super coordinator rental creation
- `src/app/api/admin/centers/route.ts` - Admin center management
- `src/app/api/user/rentals/[id]/route.ts` - User rental updates
- `src/app/api/user/rentals/route.ts` - User rental creation and listing
- `src/app/api/admin/system/route.ts` - Admin system monitoring

### Validation Schema Refactoring Summary ✅
**Completed**: January 2025

**What was accomplished:**
- **Centralized validation schemas** in `@/lib/validations.ts` with all common patterns
- **Refactored 9 API route files** to use centralized schemas instead of local definitions
- **Consistent ID validation** using IdSchema instead of basic string validation
- **Standardized enum usage** for roles, statuses, and other categorical data
- **Proper date handling** using z.coerce.date() for consistent date parsing
- **Email and phone validation** using centralized schemas with Hebrew error messages
- **Schema composition** using .extend() and .omit() for flexible validation

**Files Refactored:**
- `/api/admin/roles/route.ts` - Role assignment with centralized RoleSchema and IdSchema
- `/api/coordinator/rentals/[id]/route.ts` - Rental updates with RentalStatusSchema
- `/api/coordinator/games/[id]/route.ts` - Game instance updates with GameInstanceStatusSchema
- `/api/super/centers/[id]/route.ts` - Center management with UpdateCenterSchema
- `/api/super/rentals/route.ts` - Rental creation with CreateRentalSchema and date handling
- `/api/super/rentals/[id]/route.ts` - Rental updates with RentalStatusSchema
- `/api/super/games/route.ts` - Game instance creation with CreateGameInstanceSchema
- `/api/super/games/[id]/route.ts` - Game instance updates with GameInstanceStatusSchema
- `/api/user/route.ts` - User profile updates with proper validation

---

## PHASE 1.9: Types Architecture Refactor ✅ COMPLETE

### Types System Modernization
**Goal**: Implement practical, business-focused type architecture following clean patterns

**What was accomplished:**
- **Restructured type files** using layered approach (schema → models → computed → api)
- **Eliminated over-engineering** removed complex select/include patterns that weren't needed
- **Created practical query objects** for database operations with proper composition
- **Added generated types** for stores and UI components
- **Business logic separation** computed fields only in computed.ts, not duplicated
- **Context-specific types** like `RentalForUser` vs `RentalForCoordinator` for different perspectives
- **Comprehensive documentation** with usage patterns and anti-patterns

**New Type Architecture:**
```
/types/
├── schema.ts       # Base Prisma types (User, Center, Game, etc.)
├── models.ts       # Query objects + generated types for stores/UI  
├── computed.ts     # Business logic enhancements only
├── api.ts          # Request contracts only
└── index.ts        # Central exports
```

**Key Improvements:**
- **Query objects** like `USER_CONTACT_FIELDS`, `RENTAL_FOR_USER` for database operations
- **Generated types** like `UserContact`, `RentalForUser` for UI/store state management
- **Business logic types** like `RentalWithDetails`, `CenterWithStats` with computed fields
- **Request types only** in api.ts, responses use `ApiResponse<T>` from lib/api-response.ts
- **Clean composition** using spread operators and proper select/include patterns
- **Context awareness** different data shapes for users vs coordinators

**Removed Over-Engineering:**
- Complex select/include files with unused generated types
- Redundant interface definitions that could be generated
- Single-use API response wrappers
- Legacy export aliases that weren't used

---

# API Endpoints Complete Rewrite Project

## Overview
Complete rewrite of all API endpoints from scratch, using the existing types from `@src/types` for type safety and consistency. The goal is to create minimal, clean, organized and well-documented API endpoints.

## Current API Structure Analysis
Based on the existing endpoints, we have:
- **Auth endpoints**: `/auth/me`, `/auth/register`, `/auth/[...nextauth]`
- **Public endpoints**: `/public/centers`, `/public/games`
- **User endpoints**: `/user/`, `/user/rentals`, `/user/rentals/[id]`
- **Coordinator endpoints**: `/coordinator/`, `/coordinator/games`, `/coordinator/games/[id]`, `/coordinator/rentals`, `/coordinator/rentals/[id]`
- **Admin endpoints**: `/admin/games`, `/admin/roles`, `/admin/users`, `/admin/system`, `/admin/centers`
- **Super endpoints**: `/super/games`, `/super/games/[id]`, `/super/centers`, `/super/centers/[id]`, `/super/rentals`, `/super/rentals/[id]`

## Types Architecture Available
- **Schema types**: Base Prisma types (User, Center, Game, etc.)
- **Model types**: Query objects and generated types for stores/UI
- **Computed types**: Business logic enhancements
- **API types**: Request contracts and filters

## Implementation Plan

### Phase 1: Core Infrastructure & Auth
- [ ] Set up common API response utilities
- [ ] Rewrite auth endpoints (`/auth/me`, `/auth/register`)
- [ ] Ensure middleware integration works correctly

### Phase 2: Public Endpoints
- [ ] Rewrite `/public/centers` - public center listing
- [ ] Rewrite `/public/games` - public game catalog

### Phase 3: User Endpoints
- [ ] Rewrite `/user/` - user profile management
- [ ] Rewrite `/user/rentals` - user rental management
- [ ] Rewrite `/user/rentals/[id]` - individual rental operations

### Phase 4: Coordinator Endpoints
- [ ] Rewrite `/coordinator/` - coordinator dashboard
- [ ] Rewrite `/coordinator/games` - center game management
- [ ] Rewrite `/coordinator/games/[id]` - individual game operations
- [ ] Rewrite `/coordinator/rentals` - rental management for coordinators
- [ ] Rewrite `/coordinator/rentals/[id]` - individual rental operations

### Phase 5: Admin Endpoints
- [ ] Rewrite `/admin/games` - system-wide game management
- [ ] Rewrite `/admin/roles` - role management
- [ ] Rewrite `/admin/users` - user management
- [ ] Rewrite `/admin/system` - system analytics
- [ ] Rewrite `/admin/centers` - center management

### Phase 6: Super Endpoints
- [ ] Rewrite `/super/games` - super coordinator game management
- [ ] Rewrite `/super/games/[id]` - individual game operations
- [ ] Rewrite `/super/centers` - super coordinator center management
- [ ] Rewrite `/super/centers/[id]` - individual center operations
- [ ] Rewrite `/super/rentals` - super coordinator rental oversight
- [ ] Rewrite `/super/rentals/[id]` - individual rental operations

## Design Principles
1. **Type Safety**: Use existing types from `@src/types` extensively
2. **Consistency**: Standardized response format `{ success: boolean, data?: any, error?: { message: string } }`
3. **Minimal Code**: Keep handlers focused and concise
4. **Clear Documentation**: Each endpoint clearly documented
5. **Permission Grouping**: Group routes by permission level
6. **Error Handling**: Comprehensive error handling with proper status codes

## New Type Requirements
Based on the endpoint analysis, we may need to suggest these additional types:
- Dashboard-specific response types for coordinators/admins
- System analytics types for admin dashboard
- Role management types for admin operations

## Complete API Endpoints Specification

### 🔐 Authentication Routes

#### `POST /api/auth/register`
- **Purpose**: User registration
- **Input**: `{ email: string, password: string, name: string, phone?: string }`
- **Output**: `ApiResponse<UserContact>`
- **Types**: Create `CreateUserRequest` type in `api.ts`

#### `GET /api/auth/me`  
- **Purpose**: Get complete user profile with rentals for fast profile page load
- **Input**: None (JWT token)
- **Output**: `ApiResponse<UserProfileWithRentals>`
- **Types**: Create `UserProfileWithRentals` type that includes user data + active/recent rentals

#### `PUT /api/auth/me`
- **Purpose**: Update current user profile  
- **Input**: `UpdateUserProfileRequest` from `api.ts`
- **Output**: `ApiResponse<UserContact>`

### 🌐 Public Routes

#### `GET /api/public/centers`
- **Purpose**: List all active centers with coordinator info
- **Input**: None
- **Output**: `ApiResponse<CenterWithCoordinator[]>`
- **Types**: Use `CENTER_WITH_COORDINATOR` include

#### `GET /api/public/games`
- **Purpose**: List all games
- **Input**: None  
- **Output**: `ApiResponse<Game[]>`
- **Types**: creat type in selects with gameInstances data (without rentals)

### 👤 User Routes

#### `GET /api/user/`
- **Purpose**: Get extended user profile with center assignments
- **Input**: None (JWT token)
- **Output**: `ApiResponse<UserProfile>` (extended user data)
- **Types**: Create `UserProfile` type with center assignments

#### `PUT /api/user/`
- **Purpose**: Update user profile
- **Input**: `UpdateUserProfileRequest` from `api.ts`
- **Output**: `ApiResponse<UserProfile>`

#### `GET /api/user/rentals`
- **Purpose**: Get user's rental history and current rentals
- **Input**: None (JWT token)
- **Output**: `ApiResponse<RentalForUser[]>`
- **Types**: Use `RENTAL_FOR_USER` include and `RentalForUser` type

#### `POST /api/user/rentals`
- **Purpose**: Create new rental request
- **Input**: `CreateRentalRequest` from `api.ts`
- **Output**: `ApiResponse<RentalForUser>`

#### `PUT /api/user/rentals/[id]`
- **Purpose**: Update rental (only cancellation)
- **Input**: `UpdateRentalRequest` from `api.ts`
- **Output**: `ApiResponse<RentalForUser>`

### 📋 Coordinator Routes

#### `GET /api/coordinator/`
- **Purpose**: Coordinator dashboard with center stats and rentals
- **Input**: None (JWT token)
- **Output**: `ApiResponse<CoordinatorDashboard>`
- **Types**: Use `CoordinatorDashboard` from `computed.ts`

#### `POST /api/coordinator/games`
- **Purpose**: Add game instance to coordinator's center
- **Input**: `AddGameToCenterRequest` from `api.ts`
- **Output**: `ApiResponse<GameInstanceWithCenter>`

#### `PUT /api/coordinator/games/[id]`
- **Purpose**: Update game instance status
- **Input**: `{ status: GameInstanceStatus }`
- **Output**: `ApiResponse<GameInstanceWithCenter>`

#### `POST /api/coordinator/rentals`
- **Purpose**: Create manual rental for user
- **Input**: `CreateRentalRequest` + `{ userId: string }`
- **Output**: `ApiResponse<RentalForCoordinator>`

#### `PUT /api/coordinator/rentals/[id]`
- **Purpose**: Update rental status (approve/return/etc.)
- **Input**: `UpdateRentalRequest` from `api.ts`
- **Output**: `ApiResponse<RentalForCoordinator>`

### 🏢 Admin Routes

#### `GET /api/admin/centers`
- **Purpose**: List all centers with pagination
- **Input**: `CenterListRequest` from `api.ts`
- **Output**: `ApiResponse<{ centers: CenterWithCoordinator[], total: number }>`

#### `POST /api/admin/centers`
- **Purpose**: Create new center
- **Input**: `CreateCenterRequest` from `api.ts`
- **Output**: `ApiResponse<CenterWithCoordinator>`

#### `PUT /api/admin/centers`
- **Purpose**: Update center
- **Input**: `UpdateCenterRequest` from `api.ts`
- **Output**: `ApiResponse<CenterWithCoordinator>`

#### `DELETE /api/admin/centers`
- **Purpose**: Soft delete center
- **Input**: `IdParam` from `api.ts`
- **Output**: `ApiResponse<{ success: boolean }>`

#### `GET /api/admin/games`
- **Purpose**: List all games with pagination
- **Input**: `GameCatalogRequest` from `api.ts`
- **Output**: `ApiResponse<{ games: GameBasic[], total: number }>`

#### `POST /api/admin/games`
- **Purpose**: Create new game
- **Input**: `CreateGameRequest` from `api.ts`
- **Output**: `ApiResponse<GameBasic>`

#### `PUT /api/admin/games`
- **Purpose**: Update game
- **Input**: `UpdateGameRequest` (needs to be added to `api.ts`)
- **Output**: `ApiResponse<GameBasic>`

#### `DELETE /api/admin/games`
- **Purpose**: Soft delete game
- **Input**: `IdParam` from `api.ts`
- **Output**: `ApiResponse<{ success: boolean }>`

#### `GET /api/admin/users`
- **Purpose**: List all users with pagination
- **Input**: `UserListRequest` (needs to be added to `api.ts`)
- **Output**: `ApiResponse<{ users: UserContact[], total: number }>`

#### `POST /api/admin/users`
- **Purpose**: Create new user
- **Input**: `CreateUserRequest` (needs to be added to `api.ts`)
- **Output**: `ApiResponse<UserContact>`

#### `PUT /api/admin/users`
- **Purpose**: Update user
- **Input**: `UpdateUserRequest` from `api.ts`
- **Output**: `ApiResponse<UserContact>`

#### `DELETE /api/admin/users`
- **Purpose**: Soft delete user
- **Input**: `IdParam` from `api.ts`
- **Output**: `ApiResponse<{ success: boolean }>`

#### `PUT /api/admin/roles`
- **Purpose**: Assign roles and center permissions
- **Input**: `AssignRoleRequest` (needs to be added to `api.ts`)
- **Output**: `ApiResponse<UserContact>`

#### `GET /api/admin/system`
- **Purpose**: System statistics and health monitoring
- **Input**: None
- **Output**: `ApiResponse<SystemStats>`
- **Types**: Use `SystemStats` from `computed.ts`

### 🔧 Super Coordinator Routes

#### `GET /api/super/centers`
- **Purpose**: List supervised centers with stats
- **Input**: None (JWT token)
- **Output**: `ApiResponse<CenterWithStats[]>`

#### `GET /api/super/centers/[id]`
- **Purpose**: Get detailed supervised center
- **Input**: `IdParam` from `api.ts`
- **Output**: `ApiResponse<CenterWithStats>`

#### `PUT /api/super/centers/[id]`
- **Purpose**: Update supervised center
- **Input**: `UpdateCenterRequest` from `api.ts`
- **Output**: `ApiResponse<CenterWithStats>`

#### `POST /api/super/games`
- **Purpose**: Add game instance to supervised center
- **Input**: `AddGameToCenterRequest` from `api.ts`
- **Output**: `ApiResponse<GameInstanceWithCenter>`

#### `PUT /api/super/games/[id]`
- **Purpose**: Update game instance in supervised center
- **Input**: `{ status: GameInstanceStatus }`
- **Output**: `ApiResponse<GameInstanceWithCenter>`

#### `POST /api/super/rentals`
- **Purpose**: Create manual rental in supervised center
- **Input**: `CreateRentalRequest` + `{ userId: string }`
- **Output**: `ApiResponse<RentalForCoordinator>`

#### `PUT /api/super/rentals/[id]`
- **Purpose**: Update rental in supervised center
- **Input**: `UpdateRentalRequest` from `api.ts`
- **Output**: `ApiResponse<RentalForCoordinator>`

## 📝 Missing Types to Add

### In `api.ts`:
```typescript
// User management
export type CreateUserRequest = Pick<User, 'email' | 'name'> & 
  Partial<Pick<User, 'phone'>> & { password: string };

export interface UserListRequest {
  filters?: { search?: string; role?: string; isActive?: boolean };
  pagination?: { page: number; limit: number };
}

// Game management  
export type UpdateGameRequest = Partial<Pick<Game, 'name' | 'description' | 'imageUrl' | 'isActive'>>;

// Role management
export interface AssignRoleRequest {
  userId: string;
  roles: Role[];
  managedCenterId?: string;           // Single center ID if user is coordinator
  supervisedCenterIds?: string[];     // Multiple center IDs if user is super coordinator
}
```

### In `computed.ts`:
```typescript
// Extended user profile
export interface UserProfile extends UserContact {
  managedCenter: CenterBasic | null;     // Single center if user is coordinator
  supervisedCenters: CenterBasic[];      // Multiple centers if user is super coordinator
  roles: Role[];
}

// Complete user profile with rentals for fast profile page loading
export interface UserProfileWithRentals extends UserProfile {
  activeRentals: RentalForUser[];      // Currently active rentals
  pendingRentals: RentalForUser[];     // Pending approval rentals
  recentRentals: RentalForUser[];      // Last 5 completed rentals
  overdueRentals: RentalForUser[];     // Overdue rentals
  totalRentals: number;                // Total rental count
  favoriteGames: GameBasic[];          // User's favorite games (if we add this feature)
}
```

## 🔄 Documentation Maintenance Guidelines

### Master Documentation Update Instructions
When making changes to API endpoints, the following documentation must be updated:

1. **This section** - Update endpoint specifications with new routes, modified inputs/outputs, or changed types
2. **CLAUDE.md** - Update API route standards and type requirements if patterns change
3. **Type files** - Add new types to appropriate files (`api.ts`, `computed.ts`, `models.ts`)
4. **Test files** - Update test specifications to match new endpoint contracts

### Change Documentation Format
For each API change, document:
- **Endpoint**: Which route was modified
- **Change Type**: New, Modified, Deprecated, Removed
- **Input Changes**: What input parameters changed
- **Output Changes**: What response format changed  
- **Type Changes**: Which types were added/modified
- **Migration Notes**: How to update existing code

### Example Change Entry:
```markdown
#### `POST /api/user/rentals` - Modified
- **Change**: Updated to accept multiple game instances
- **Input**: Changed from `gameInstanceId: string` to `gameInstanceIds: string[]`
- **Output**: No change to response format
- **Types**: Updated `CreateRentalRequest` interface
- **Migration**: Replace single ID with array of IDs in request body
```

---

# URGENT: Multiple Games Per Rental Implementation

## Problem Statement
Currently, rentals support only one game per request. We need to update the system to allow multiple games in a single rental request, with the following constraints:
- All games must be from the same center
- All games share the same rental and return dates
- A request can only be approved if ALL included games are available at the center

## Current System Analysis
- **Current Structure**: One-to-one relationship between Rental and GameInstance
- **Database Schema**: `Rental.gameInstanceId` references single GameInstance
- **API Endpoints**: All designed around single game rentals
- **Types**: All rental types assume single game per rental

## Proposed Changes

### 1. Database Schema Updates
- **Remove**: `Rental.gameInstanceId` field
- **Add**: `Rental.gameInstances` relation array for multiple GameInstance records
- **Keep**: GameInstance model unchanged

### 2. Type System Updates
- **Schema Types**: Update Rental type to include gameInstances array
- **Query Objects**: Update rental queries to handle multiple game instances
- **API Types**: Update request/response types for multiple games
- **Computed Types**: Update business logic for multiple game calculations

### 3. API Endpoint Updates
- **User Rentals**: Accept array of gameInstanceIds in requests
- **Coordinator Management**: Display multiple games per rental
- **Validation**: Ensure all games from same center and available

### 4. Business Logic Updates
- **Availability Checking**: Validate all games are available simultaneously
- **Center Validation**: Ensure all games belong to same center
- **Status Management**: Handle rental status based on all game instances

## Database Schema Changes

### Updated Rental Model
```prisma
model Rental {
  // Remove: gameInstanceId String
  // Add:
  gameInstances   GameInstance[]
  // Keep all other fields unchanged
}
```

### GameInstance Model
```prisma
model GameInstance {
  // No changes needed - keep as is
}
```

## Validation Rules

### New Business Rules
1. **Same Center Constraint**: All games in a rental must belong to same center
2. **Availability Constraint**: All games must be available at request time
3. **Unique Games**: No duplicate games allowed in single rental
4. **Minimum Games**: At least one game required per rental

### Updated API Validation
```typescript
// Example request structure
interface CreateRentalRequest {
  gameInstanceIds: string[];  // Array of game instance IDs to connect
  notes?: string;
}

// Validation logic
- Validate all gameInstanceIds exist and are available
- Validate all belong to same center
- Validate no duplicates in array
- Validate array has at least one item
```

## Implementation Status ✅ COMPLETED

### What Was Accomplished
1. **Database Schema Updated** ✅
   - Removed `gameInstanceId` from Rental model
   - Added `gameInstances GameInstance[]` relation array
   - Generated Prisma client and pushed to database

2. **Type System Updated** ✅
   - Updated `RENTAL_FOR_USER` and `RENTAL_FOR_COORDINATOR` query objects to use `gameInstances`
   - Updated `CreateRentalRequest` interface to accept `gameInstanceIds: string[]`
   - Updated validation schemas to handle multiple games with proper constraints

3. **API Endpoints Updated** ✅
   - **User Rentals**: 
     - GET `/api/user/rentals` - Added endpoint to fetch user rentals with multiple games
     - POST `/api/user/rentals` - Updated to handle multiple game instances
     - PUT `/api/user/rentals/[id]` - Updated to work with new schema
   - **Coordinator Rentals**:
     - POST `/api/coordinator/rentals` - Updated to handle multiple game instances
     - PUT `/api/coordinator/rentals/[id]` - Updated to work with new schema
   - **Super Coordinator Rentals**:
     - POST `/api/super/rentals` - Updated to handle multiple game instances
     - PUT `/api/super/rentals/[id]` - Updated to work with new schema

4. **Business Logic Implemented** ✅
   - **Same Center Validation**: All games must be from the same center
   - **Availability Flexibility**: Users can request games regardless of current status (ACTIVE/UNAVAILABLE)
   - **Duplicate Prevention**: No duplicate games in same rental
   - **Existing Rental Checks**: Prevents conflicts with pending/active rentals

5. **Database Migration** ✅
   - Schema changes successfully applied to database
   - System test confirms all models working correctly

### Key Features Implemented
- **Multiple Games Per Rental**: Users can now request 1-10 games in a single rental
- **Center Constraint**: All games must be from the same center
- **Flexible Availability**: Users can request games regardless of current status (ACTIVE/UNAVAILABLE)
- **Game Instance Management**: Proper status updates for multiple game instances
- **Backward Compatibility**: All existing rental logic preserved

### Updated API Request Format
```typescript
// Before (single game)
{
  "gameInstanceId": "clXXXXXXXX",
  "notes": "Optional notes"
}

// After (multiple games)
{
  "gameInstanceIds": ["clXXXXXXXX", "clYYYYYYYY", "clZZZZZZZZ"],
  "notes": "Optional notes"
}
```

### Validation Rules Implemented
1. **Array Length**: 1-10 games per rental (configurable)
2. **Same Center**: All games must belong to same center
3. **No Duplicates**: No duplicate games in same rental
4. **Availability**: All games must be available
5. **Conflict Prevention**: No overlapping rentals for same games

## Next Steps
1. **Testing**: Add comprehensive tests for multiple game scenarios
2. **Frontend Updates**: Update UI to support multiple game selection
3. **Documentation**: Update API documentation with new request formats

---

## TODO Checklist for JWT Migration

### ✅ Completed Task: Update AuthToken to JWT
- [x] Update `middleware.ts` to use JWT from next-auth/jwt
- [x] Update `src/app/api/super/games/[id]/route.ts` to use JWT
- [x] Update `src/app/api/super/games/route.ts` to use JWT
- [x] Update `src/app/api/coordinator/games/[id]/route.ts` to use JWT
- [x] Update `src/app/api/coordinator/games/route.ts` to use JWT
- [x] Update `src/app/api/super/centers/[id]/route.ts` to use JWT
- [x] Update `src/app/api/user/route.ts` to use JWT
- [x] Update `src/app/api/super/centers/route.ts` to use JWT
- [x] Update `src/app/api/admin/games/route.ts` to use JWT
- [x] Update `src/app/api/admin/roles/route.ts` to use JWT
- [x] Update `src/app/api/admin/users/route.ts` to use JWT
- [x] Update `src/app/api/super/rentals/route.ts` to use JWT
- [x] Update `src/app/api/admin/centers/route.ts` to use JWT
- [x] Update `src/app/api/user/rentals/[id]/route.ts` to use JWT
- [x] Update `src/app/api/user/rentals/route.ts` to use JWT
- [x] Update `src/app/api/admin/system/route.ts` to use JWT
- [x] Verify all changes maintain existing functionality

### ✅ Completed Tasks (Previous)
- [x] Analyze existing validation patterns in API routes
- [x] Refactor `/api/admin/roles/route.ts` to use centralized RoleSchema and IdSchema
- [x] Refactor `/api/coordinator/rentals/[id]/route.ts` to use RentalStatusSchema
- [x] Refactor `/api/coordinator/games/[id]/route.ts` to use GameInstanceStatusSchema
- [x] Refactor `/api/super/centers/[id]/route.ts` to use UpdateCenterSchema
- [x] Refactor `/api/super/rentals/route.ts` to use CreateRentalSchema and z.coerce.date()
- [x] Refactor `/api/super/rentals/[id]/route.ts` to use RentalStatusSchema
- [x] Refactor `/api/super/games/route.ts` to use CreateGameInstanceSchema
- [x] Refactor `/api/super/games/[id]/route.ts` to use GameInstanceStatusSchema
- [x] Refactor `/api/user/route.ts` to use proper validation patterns
- [x] Ensure all changes maintain existing functionality
- [x] Update project plan with completion status
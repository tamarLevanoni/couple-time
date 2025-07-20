# Current Tasks - Couple-Time Project

## Active Task: UI Implementation - Phase 5

### Task Summary
Implement UI components and pages using the completed Zustand store architecture. Building user interfaces for all user stories with role-based navigation and functionality.

### Current Status: PLANNING

### Implementation Plan

#### Phase 1: Public UI Components (US-1.1, US-1.2)
- [ ] **Game Catalog Page** - Browse games with filtering/search
- [ ] **Center Finder Page** - Find nearby centers with map/filters
- [ ] **Navigation Header** - Public navigation with auth buttons
- [ ] **Game Card Component** - Display game details
- [ ] **Center Card Component** - Display center details  
- [ ] **Filter Components** - Category, audience, area filters

#### Phase 2: User Authentication & Rental UI (US-1.3, US-1.4, US-1.6, US-1.7)

**Authentication Flow Implementation:**
- [ ] **Auth Provider Setup** - Wrap app with NextAuth + Zustand + SWR providers
- [ ] **Session Management** - Check session on app load, sync with stores
- [ ] **SWR User Data Integration** - Replace manual user store API calls with SWR hooks
- [ ] **Profile Completion Flow** - Handle `needsProfileCompletion` for Google OAuth
- [ ] **Route Protection** - Middleware-based access control for protected pages
- [ ] **Hybrid Store Architecture** - SWR for data fetching, Zustand for computed state

**UI Components:**
- [ ] **Login/Register Pages** - Email and Google OAuth options  
- [ ] **Profile Completion Modal** - Name/phone for new Google users
- [ ] **User Profile Page** - View/edit profile details
- [ ] **Rental Request Form** - Create new rental requests
- [ ] **My Rentals Page** - View/manage user rentals
- [ ] **Rental Details Modal** - Full rental information
- [ ] **Protected Route Wrapper** - Role-based access control

**Authentication Flow Architecture:**

**Entry Points & Pages:**
- `/auth/signin` - Email/password + Google OAuth login
- `/auth/signup` - User registration with profile completion  
- `/auth/error` - Centralized error handling with Hebrew messages

**Core Authentication Flows:**
```
Email/Password: User Input → LoginForm → NextAuth credentials → JWT → Session → Zustand stores
Google OAuth: Google Sign-in → Check existing user → Profile completion (if needed) → JWT → Session → Zustand stores
```

**Profile Completion Logic (`needsProfileCompletion`):**
- **Trigger:** New Google OAuth users (no existing account with email)
- **Set in JWT callback:** `token.needsProfileCompletion = true`
- **Process:** User redirected → Complete name + phone → `/api/auth/complete-google-profile` → User record created → Flag cleared

**Hybrid SWR + Zustand Integration Pattern:**
```
App Load → Session Check → SWR fetches /api/user → Zustand computed selectors → UI Hydration
Login → NextAuth → JWT → Session → SWR auto-fetches user data → Stores sync
Logout → NextAuth signOut → SWR cache cleared → Zustand state reset
Profile Update → SWR mutate() with optimistic updates → Auto-revalidation
```

**SWR Integration Benefits:**
- **Automatic caching & revalidation** - Fresh data without manual calls
- **Built-in loading/error states** - Less boilerplate in stores
- **Background refetching** - Data stays current when user returns to tab
- **Optimistic updates** - Better UX for profile updates with automatic rollback
- **Request deduplication** - Multiple components use same data efficiently

**Hybrid Architecture:**
- **SWR**: Data fetching, caching, loading/error states, revalidation
- **Zustand**: Computed selectors (`useIsCoordinator`), business logic, derived state
- **NextAuth**: Session management, authentication state

**API Integration Points:**
- **`/api/user`** - GET (profile + rentals), PUT (update profile)  
- **`/api/auth/complete-google-profile`** - POST (complete Google profile)
- **Auto-triggered:** Auth store login() → User store loadUserData() → Populate UI

**SWR + Zustand Usage Patterns:**
```typescript
// SWR for data fetching + caching
const { data: userData, error, mutate } = useSWR('/api/user', fetcher);

// Zustand for computed state + business logic  
const userStore = useUserStore();
const isCoordinator = userStore.isCoordinator(userData?.roles);
const rentalCounts = userStore.computeRentalCounts(userData?.rentals);

// Profile updates with optimistic UI
const updateProfile = (data) => mutate('/api/user', updateUserAPI(data), {
  optimisticData: { ...userData, ...data },
  rollbackOnError: true
});
```

**Migration Strategy:**
1. **Phase 2A**: Replace user store API calls with SWR hooks
2. **Phase 2B**: Remove loading/error states from stores (use SWR's)  
3. **Phase 2C**: Convert stores to pure computed state managers
4. **Future**: Apply SWR pattern to games/centers/rentals stores

#### Phase 3: Coordinator Dashboard (US-2.x)
- [ ] **Coordinator Dashboard** - Overview with pending/active rentals
- [ ] **Rental Management Table** - Approve/manage rentals
- [ ] **Game Instance Management** - Update game status/notes
- [ ] **Manual Rental Creation** - Create rentals for users
- [ ] **Center Statistics** - Basic metrics and data

#### Phase 4: Admin Interface (US-4.x)
- [ ] **Admin Dashboard** - System overview and navigation
- [ ] **User Management** - CRUD operations for users
- [ ] **Center Management** - CRUD operations for centers  
- [ ] **Game Management** - CRUD operations for games
- [ ] **Role Assignment** - Assign roles to users
- [ ] **System Reports** - Statistics and analytics

#### Phase 5: Polish & Integration
- [ ] **Responsive Design** - Mobile-first optimization
- [ ] **Error Boundaries** - Graceful error handling
- [ ] **Loading States** - Proper UX for async operations
- [ ] **Toast Notifications** - User feedback system
- [ ] **Route Guards** - Complete permission system

---

---

## Previous Task: Completed - Zustand Store Implementation ✅

**Auth Store (COMPLETED)** ✅
- [x] User session state (UserContact | null)
- [x] Authentication status tracking  
- [x] Profile loading from `/api/user`
- [x] Profile updates via PUT `/api/user`
- [x] Login/logout state management
- [x] Loading and error states

**Games Store (COMPLETED)** ✅
Based on user stories US-1.1 (Browse Game Catalog):
- [x] Public games listing from `/api/public/games` (GameBasic[])
- [x] Game filtering by categories/audiences 
- [x] Game availability by center
- [x] Search functionality
- [x] Clear filters functionality

**Centers Store (COMPLETED)** ✅
Based on user stories US-1.2 (Find Nearby Center) - PUBLIC ONLY:
- [x] Public centers listing from `/api/public/centers` (CenterPublicInfo[])
- [x] Center filtering by area/city
- [x] Search centers functionality
- [x] Clear filters functionality

**Rentals Store (COMPLETED)** ✅
Based on user stories US-1.3, US-1.4 (Request/Manage Rentals) - USER ONLY:
- [x] User rental listing from `/api/user/rentals` (RentalForUser[])
- [x] Create rental via POST `/api/user/rentals` (CreateRentalInput)
- [x] Cancel rental via PUT `/api/user/rentals/[id]` (action: 'cancel')
- [x] Rental status filtering (pending/active/history)
- [x] Rental counts for tabs (pending/active/history totals)
- [x] Can cancel rental validation

**Coordinator Store (COMPLETED)** ✅
Based on user stories US-2.x - ALL COORDINATOR OPERATIONS:
- [x] Dashboard data from `/api/coordinator` (CoordinatorDashboardData)
- [x] **Rental management via `/api/coordinator/rentals`** (approve/manage/manual create)
- [x] **Game instance management via `/api/coordinator/games`** (status/notes updates)
- [x] Center statistics (included in dashboard)
- [x] Active/pending rental filtering with overdue detection
- [x] Rental counts for dashboard metrics

**Admin Store (COMPLETED)** ✅
Based on user stories US-4.x - ALL ADMIN OPERATIONS:
- [x] User management via `/api/admin/users` (create/update/roles/block)
- [x] **Center management via `/api/admin/centers`** (create/update/delete/assign coordinators)
- [x] **Game management via `/api/admin/games`** (create/update/delete)
- [x] Role assignments via `/api/admin/roles`
- [x] System statistics via `/api/admin/system`

**Store Exports (COMPLETED)** ✅
- [x] Central index file for clean imports
- [x] Role-based organization of exports
- [x] Computed selectors exported

#### Phase 2: Store Integration (COMPLETED) ✅
- [x] Update existing `use-data-init.ts` hook to work with new stores
- [x] Stores leverage existing types from `/types` architecture
- [x] Proper error handling and loading states implemented
- [x] Store persistence not needed for current requirements

#### Phase 3: Testing & Validation (DEFERRED) 
- [ ] Write store unit tests (will be done during UI development)
- [ ] Integration testing with existing API endpoints (will happen naturally with UI)
- [ ] Performance validation and optimization (as needed during UI work)

### Technical Requirements ✅
- [x] Use existing types from `/types` (schema → models → computed)
- [x] Follow standardized API response format `{ success: boolean, data?, error? }`
- [x] Implement proper loading states and error handling
- [x] Leverage existing API endpoints without modification

### Deliverables Completed ✅
- **6 Complete Stores**: Auth, Games, Centers, Rentals, Coordinator, Admin
- **Role-Based Architecture**: Clear separation by user permissions
- **API Integration**: All stores use existing API endpoints
- **Type Safety**: Proper TypeScript with existing type system
- **Error Handling**: Standardized error states and loading indicators
- **Computed Selectors**: Filtered data and metrics calculations

### Next Phase: UI Implementation
**Recommendation**: Start UI development with core user flows (US-1.1 Browse Games) to validate store integration in real usage.

---

## Previous Task: Completed - API Route Testing Overhaul ✅

Complete recreation of all API route tests with 19 test files covering 26 API routes, standardized patterns, and comprehensive coverage.

## Notes
- Follow `CLAUDE.md` workflow: plan → approve → implement → test
- Update `PROJECT-OVERVIEW.md` when this task completes
- Archive completed work in `docs/phases/`
- **CRITICAL**: Use existing types from `/lib/validations.ts` exports (CreateGameInput, etc.) not from `/types`
- **TYPE ERROR FIX NEEDED**: Games store imports non-existent types - fix imports to use validations.ts

---
*Last Updated: January 2025*
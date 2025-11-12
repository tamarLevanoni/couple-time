# Admin Dashboard Implementation Plan

## Overview

This document outlines the complete plan for implementing the admin dashboard with all required features.

## Current State

### What Exists ✓
- Complete admin API routes (users, centers, games, roles, system stats)
- Admin Zustand store with all CRUD operations
- Basic UI: AdminDashboard component with 4 tabs
- Three management table components (card-based lists)
- SystemStats component with 6 KPI cards
- Complete type system (UserForAdmin, CenterWithCoordinator, GameWithInstances)
- All UI components (Table, Modal, Form components, Button, etc.)
- Comprehensive test coverage for API routes
- **✅ NEW: Dialog component using @radix-ui/react-dialog (shadcn/ui style)**
- **✅ NEW: Base modal components (BaseFormModal, ConfirmDialog)**
- **✅ NEW: Form field components (RoleSelector, AreaSelector, CoordinatorSelector, CenterSelector)**
- **✅ NEW: Enhanced labels system with Hebrew translations (src/lib/labels.ts)**

### What's Missing ✗
- Modals for create/edit/details operations (User, Center, Game)
- Proper table implementation using @tanstack/react-table (currently card-based lists)
- Integration of modals with existing tables
- Search and filter functionality in tables

## Requirements (Hebrew)

1. טעינת דשבורד אדמין (Hydration) - Admin dashboard loading
2. ניהול משתמשים – טבלה (User Management - Table)
3. עריכת פרטי משתמש (Edit user details)
4. שינוי הרשאות משתמש (Role) (Change user permissions/role)
5. חסימת/שחרור משתמש (Block/unblock user)
6. ניהול מוקדים – טבלה (Center Management - Table)
7. הוספת מוקד חדש (Add new center)
8. שיוך/ניתוק רכזים למוקד (Assign/detach coordinators to center)
9. ניהול משחקים גלובלי – טבלה (Global game management - Table)
10. הוספת משחק גלובלי (Add global game)
11. שיוך משחקים למוקדים (Assign games to centers)

## Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2) ✅ COMPLETE
Foundation components that everything depends on.

**Task 1.1: Refactor Tables** ✅ COMPLETE
- ✅ Created: [data-table.tsx](src/components/ui/data-table.tsx) - Reusable DataTable component using @tanstack/react-table
- ✅ Refactored: [user-management-table.tsx](src/components/admin/user-management-table.tsx) - Full table with sortable columns, search, Hebrew labels
- ✅ Refactored: [center-management-table.tsx](src/components/admin/center-management-table.tsx) - Full table with sortable columns, search, "Add Center" button
- ✅ Refactored: [game-management-table.tsx](src/components/admin/game-management-table.tsx) - Full table with sortable columns, search, "Add Game" button
- ✅ Features: Sortable columns, search functionality, mobile responsive (card view), loading states, Hebrew labels

**Task 1.2: Create Base Modal Components** ✅ COMPLETE
- ✅ Created: [dialog.tsx](src/components/ui/dialog.tsx) - Radix UI Dialog component (shadcn/ui style)
- ✅ Created: [base-form-modal.tsx](src/components/admin/modals/base-form-modal.tsx)
- ✅ Created: [confirm-dialog.tsx](src/components/admin/modals/confirm-dialog.tsx)
- ✅ Features: Form state, loading, error display, callbacks, proper dialog accessibility

**Task 1.3: Create Form Field Components** ✅ COMPLETE
- ✅ Created: [role-selector.tsx](src/components/admin/forms/role-selector.tsx) - Multi/single role selection with Hebrew labels
- ✅ Created: [area-selector.tsx](src/components/admin/forms/area-selector.tsx) - Area dropdown with Hebrew labels
- ✅ Created: [coordinator-selector.tsx](src/components/admin/forms/coordinator-selector.tsx) - Coordinator selector with role filtering
- ✅ Created: [center-selector.tsx](src/components/admin/forms/center-selector.tsx) - Multi/single center selection
- ✅ Enhanced: [labels.ts](src/lib/labels.ts) - Added getRoleLabel() function (renamed from game-labels.ts)

### Phase 2: User Management (Days 3-4) ✅ COMPLETE

**Task 2.1: User Details Modal** ✅
- ✅ Created: [user-details-modal.tsx](src/components/admin/modals/user-details-modal.tsx)
- ✅ Display user info, roles, managed/supervised centers
- ✅ Quick actions: edit, block/unblock
- ✅ Hebrew date formatting

**Task 2.2: Edit User Modal** ✅
- ✅ Created: [edit-user-modal.tsx](src/components/admin/modals/edit-user-modal.tsx)
- ✅ Edit firstName, lastName, phone
- ✅ Client-side validation with Hebrew errors
- ✅ Validation: UpdateUserSchema

**Task 2.3: Assign Role Modal** ✅
- ✅ Created: [assign-role-modal.tsx](src/components/admin/modals/assign-role-modal.tsx)
- ✅ Multi-select roles
- ✅ Conditional fields:
  - CENTER_COORDINATOR: Show single center selector
  - SUPER_COORDINATOR: Show multiple centers selector
  - ADMIN: No center selection needed
- ✅ Validation: AssignRoleSchema

**Task 2.4: Update User Management Table** ✅
- ✅ Enhanced: [user-management-table.tsx](src/components/admin/user-management-table.tsx)
- ✅ Wired up all 3 modals with state management
- ✅ Added Edit and Assign Role buttons
- ✅ Search by name exists (from Phase 1)
- ✅ Updated mobile card view with all actions

### Phase 3: Center Management (Days 5-6) ⚠️ IN PROGRESS

**Task 3.1: Center Details Modal** ✅
- ✅ Created: [center-details-modal.tsx](src/components/admin/modals/center-details-modal.tsx)
- ✅ Display center info, coordinator details
- ✅ Show game instances count and availability
- ✅ Show active/pending rentals count

**Task 3.2: Create Center Modal** ✅
- ✅ Created: [create-center-modal.tsx](src/components/admin/modals/create-center-modal.tsx)
- ✅ Form: name, area, coordinatorId (optional), superCoordinatorId (optional)
- ✅ Validation: CreateCenterSchema

**Task 3.3: Edit Center Modal** ✅
- ✅ Created: [edit-center-modal.tsx](src/components/admin/modals/edit-center-modal.tsx)
- ✅ Edit name, area, isActive
- ✅ Validation: UpdateCenterSchema

**Task 3.4: Assign Coordinators Modal** ✅
- ✅ Created: [assign-coordinators-modal.tsx](src/components/admin/modals/assign-coordinators-modal.tsx)
- ✅ Select center coordinator (CENTER_COORDINATOR role users)
- ✅ Select super coordinator (SUPER_COORDINATOR role users)
- ✅ Allow clearing assignments

**Task 3.5: Update Center Management Table** ⏳ PENDING
- Enhance: [center-management-table.tsx](src/components/admin/center-management-table.tsx)
- Add "Add Center" button (already exists from Phase 1)
- Wire up all 4 modals
- Add modal state management
- Add handler functions
- Search by name exists (from Phase 1)

### Phase 4: Game Management (Day 7)

**Task 4.1: Game Details Modal**
- New: [game-details-modal.tsx](src/components/admin/modals/game-details-modal.tsx)
- Display game info, categories, target audiences
- Show total instances and breakdown by center
- Show availability stats

**Task 4.2: Create Game Modal**
- New: [create-game-modal.tsx](src/components/admin/modals/create-game-modal.tsx)
- Form: name, description, categories (multi), targetAudiences (multi), imageUrl
- Image preview
- Validation: CreateGameSchema

**Task 4.3: Edit Game Modal**
- New: [edit-game-modal.tsx](src/components/admin/modals/edit-game-modal.tsx)
- Edit all game fields
- Validation: UpdateGameSchema

**Task 4.4: Assign Games to Centers Modal**
- New: [assign-games-modal.tsx](src/components/admin/modals/assign-games-modal.tsx)
- Select game from dropdown
- Select target centers (multiple)
- Create game instances for selected centers

**Task 4.5: Update Game Management Table**
- Enhance: [game-management-table.tsx](src/components/admin/game-management-table.tsx)
- Add "Add Game" button
- Wire up all modals
- Add search by name
- Add filter by category and target audience

### Phase 5: Polish & Testing (Day 8)

**Task 5.1: Admin Dashboard Hydration**
- Enhance: [admin-dashboard.tsx](src/components/admin/admin-dashboard.tsx)
- Optimize initial data loading
- Add refresh button per tab
- Add last updated timestamp
- Improve error states

**Task 5.2: System Stats Enhancement**
- Enhance: [system-stats.tsx](src/components/admin/system-stats.tsx)
- Add more metrics
- Add trend indicators
- Make stats clickable to filter related tab

**Task 5.3: Comprehensive Testing**
- Create integration tests for complete flows
- Test error scenarios
- Test loading states
- Test permission checks

**Task 5.4: Error Handling & Edge Cases**
- Handle network failures
- Handle validation errors
- Handle delete dependencies
- Handle role conflicts

## File Structure

```
/src/components/admin/
├── admin-dashboard.tsx (existing - update later)
├── system-stats.tsx (existing - update later)
├── user-management-table.tsx ✅ (refactored - using DataTable)
├── center-management-table.tsx ✅ (refactored - using DataTable)
├── game-management-table.tsx ✅ (refactored - using DataTable)
├── index.ts ✅ (new - exports all admin components)
├── forms/
│   ├── role-selector.tsx ✅ (new - complete)
│   ├── area-selector.tsx ✅ (new - complete)
│   ├── coordinator-selector.tsx ✅ (new - complete)
│   └── center-selector.tsx ✅ (new - complete)
└── modals/
    ├── base-form-modal.tsx ✅ (new - complete)
    ├── confirm-dialog.tsx ✅ (new - complete)
    ├── user-details-modal.tsx (pending)
    ├── edit-user-modal.tsx (pending)
    ├── assign-role-modal.tsx (pending)
    ├── center-details-modal.tsx (pending)
    ├── create-center-modal.tsx (pending)
    ├── edit-center-modal.tsx (pending)
    ├── assign-coordinators-modal.tsx (pending)
    ├── game-details-modal.tsx (pending)
    ├── create-game-modal.tsx (pending)
    ├── edit-game-modal.tsx (pending)
    └── assign-games-modal.tsx (pending)

/src/components/ui/
├── dialog.tsx ✅ (new - Radix UI Dialog component)
└── data-table.tsx ✅ (new - Reusable table with @tanstack/react-table)

/src/lib/
└── labels.ts ✅ (renamed from game-labels.ts, added getRoleLabel)
```

## Key Design Decisions

### 1. Progressive Loading Strategy
- Stats load first (200ms)
- Users load second (500ms)
- Centers load third (800ms)
- Games load last (1200ms)
- Users see content immediately

### 2. Table Architecture
- Use @tanstack/react-table for desktop
- Desktop: Full data tables with sorting, filtering, pagination
- Mobile: Card-based lists with essential info
- Bulk actions for efficiency

### 3. Modal Types (5 total)
- **UserModal**: Create/Edit/View with role display
- **RoleAssignmentModal**: Conditional center selection based on role
- **CenterModal**: Coordinator assignment with validation
- **GameModal**: Multi-category selection with image preview
- **GameToCenterModal**: Bulk instance creation

### 4. Accessibility
- All WCAG 2.1 AA requirements
- Keyboard navigation throughout
- ARIA labels on all interactive elements
- Screen reader support

### 5. Responsive Strategy
- Mobile: Single column, bottom sheets, card lists
- Tablet: 2 columns, side drawers, scrollable tables
- Desktop: Full grid, centered modals, all columns

## Data Flow Patterns

### User Role Assignment Flow
```
1. Click "Assign Role" → Open AssignRoleModal
2. Select roles from multi-select
3. If CENTER_COORDINATOR: Show managed center dropdown
4. If SUPER_COORDINATOR: Show supervised centers multi-select
5. Submit → adminStore.assignRole(data) → PUT /api/admin/roles
6. Success: Reload users, close modal, show toast
7. Error: Display in modal, allow retry
```

### Center Coordinator Assignment Flow
```
1. Click "Assign Coordinators" → Open AssignCoordinatorsModal
2. Show two dropdowns filtered by role:
   - Center Coordinator (CENTER_COORDINATOR users)
   - Super Coordinator (SUPER_COORDINATOR users)
3. Submit → adminStore.updateCenter(id, data) → PUT /api/admin/centers/[id]
4. Success: Update state, close modal, show toast
5. Error: Display in modal, allow retry
```

### Game Instance Assignment Flow
```
1. Click "Assign to Centers" → Open AssignGamesModal
2. Select target centers (multiple)
3. For each center: Create game instance via API
4. Success: Show created count, close modal
5. Error: Show which failed, allow retry for failed only
```

## Testing Strategy

### Unit Tests
- Each modal component in isolation
- Form validation logic
- Search/filter logic
- Store actions

### Integration Tests
- Complete user management flow (create → edit → assign role → delete)
- Complete center management flow (create → edit → assign coordinator → delete)
- Complete game management flow (create → edit → assign to centers → delete)

## Success Metrics

### Functional
- All 11 requirements implemented
- All API endpoints integrated
- All store actions used correctly
- No unused code

### Quality
- Test coverage >80%
- Proper validation on all forms
- Graceful error handling
- Loading states everywhere
- Mobile-responsive

### Performance
- Initial load <2s
- Modal animations smooth (60fps)
- Search/filter instant (<100ms)
- No redundant API calls

## Dependencies

### NPM Packages
- ✅ @tanstack/react-table (installed - version 8.21.3)
- ✅ @radix-ui/react-dialog (installed - for Dialog component)
- ✅ All others already in package.json

### Critical Path
1. Phase 1 (Foundation) - ✅ COMPLETE (All tasks done)
2. Phases 2, 3, 4 can run in parallel now that Phase 1 is complete
3. Phase 5 requires all previous phases

### Latest Updates (2025-11-10)
- ✅ **Phase 1 COMPLETE**: All core infrastructure tasks finished
- ✅ Created DataTable component with @tanstack/react-table integration
- ✅ Refactored all 3 management tables (Users, Centers, Games) to use DataTable
- ✅ Added sortable columns, search functionality, and loading states
- ✅ Implemented mobile-responsive design (desktop table + mobile cards)
- ✅ Added "Add Center" and "Add Game" buttons to respective tables
- ✅ All tables use Hebrew labels from centralized labels system
- ✅ Tables support isLoading prop for better UX

### Previous Updates (2025-07-24)
- ✅ Installed @radix-ui/react-dialog
- ✅ Created Dialog component following shadcn/ui patterns
- ✅ Created BaseFormModal and ConfirmDialog using new Dialog component
- ✅ Created all form field components (RoleSelector, AreaSelector, CoordinatorSelector, CenterSelector)
- ✅ Enhanced labels system: renamed game-labels.ts → labels.ts, added getRoleLabel()
- ✅ All components use Hebrew labels from centralized labels.ts
- ✅ Updated imports in existing files (centers/page.tsx, rent components)
- ✅ Created admin/index.ts for centralized component exports

## Future Enhancements (Post-Launch)

1. Bulk operations
2. Export functionality (CSV/Excel)
3. Audit logs
4. Advanced analytics
5. Real-time updates (WebSocket)
6. Image upload for games
7. Map picker for center location
8. User activity timeline

## Design Documentation

Detailed design specifications are available in:
- [docs/design/admin-dashboard-ui-spec.md](docs/design/admin-dashboard-ui-spec.md) - Full specification (64KB)
- [docs/design/admin-dashboard-summary.md](docs/design/admin-dashboard-summary.md) - Quick reference (6.5KB)
- [docs/design/admin-component-diagram.md](docs/design/admin-component-diagram.md) - Visual diagrams (31KB)

## Standards Compliance

All implementation follows:
- Project standards in [CLAUDE.md](CLAUDE.md)
- Types architecture in [/types](src/types/)
- Component patterns in [/components/ui](src/components/ui/)
- API standards: `{ success, data, error }` format
- Testing standards: vitest only
- No emojis unless requested

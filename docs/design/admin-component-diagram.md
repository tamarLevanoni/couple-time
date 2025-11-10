# Admin Dashboard Component Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                       AdminDashboard                            │
│  (Main container with tab state management)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ DashboardHeader│    │   ErrorAlert  │    │  TabsContainer│
│  - Title       │    │  (conditional)│    │   - 4 Tabs    │
│  - Subtitle    │    └───────────────┘    └───────────────┘
└───────────────┘                                   │
                                                    │
        ┌───────────────────┬───────────────────────┼───────────────────┐
        │                   │                       │                   │
        ▼                   ▼                       ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Tab: Overview│  │  Tab: Users    │  │  Tab: Centers  │  │  Tab: Games    │
└───────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
        │                   │                       │                   │
        │                   │                       │                   │
        ▼                   ▼                       ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ SystemStats   │  │DataTableToolbar│  │DataTableToolbar│  │DataTableToolbar│
│  (6 KPI cards)│  │  - Search      │  │  - Search      │  │  - Search      │
└───────────────┘  │  - Filters     │  │  - Filters     │  │  - Filters     │
        │          │  - Bulk Actions│  │  - Actions     │  │  - Bulk Actions│
        ▼          └────────────────┘  └────────────────┘  └────────────────┘
┌───────────────┐           │                      │                   │
│ QuickActions  │           ▼                      ▼                   ▼
│  (NEW)        │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
└───────────────┘  │ UsersDataTable │  │CentersDataTable│  │ GamesDataTable │
        │          │  - Columns     │  │  - Columns     │  │  - Columns     │
        ▼          │  - Row Actions │  │  - Row Actions │  │  - Row Actions │
┌───────────────┐  │  - Selection   │  │  - Selection   │  │  - Selection   │
│RecentActivity │  └────────────────┘  └────────────────┘  └────────────────┘
│  (NEW)        │           │                      │                   │
└───────────────┘           ▼                      ▼                   ▼
                   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
                   │   Pagination   │  │   Pagination   │  │   Pagination   │
                   └────────────────┘  └────────────────┘  └────────────────┘
```

## Modal Components (Portal Rendered)

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Modal Layer (Portal)                        │
│  (Rendered at body level, conditionally displayed)                   │
└──────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   UserModal     │      │  CenterModal    │      │   GameModal     │
│  - Create mode  │      │  - Create mode  │      │  - Create mode  │
│  - Edit mode    │      │  - Edit mode    │      │  - Edit mode    │
│  - View mode    │      └─────────────────┘      └─────────────────┘
└─────────────────┘                                         │
        │                                                   │
        ▼                                                   ▼
┌─────────────────┐                          ┌─────────────────────────┐
│RoleAssignment   │                          │  GameToCenterModal      │
│    Modal        │                          │  - Multi-select centers │
│  - Role select  │                          │  - Instance count       │
│  - Center select│                          │  - Bulk creation        │
└─────────────────┘                          └─────────────────────────┘
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         User Actions                           │
└────────────────────────────────────────────────────────────────┘
                                │
                                │
        ┌───────────────────────┼───────────────────┐
        │                       │                   │
        ▼                       ▼                   ▼
┌───────────────┐      ┌───────────────┐   ┌──────────────┐
│  Table Action │      │  Modal Action │   │ Bulk Action  │
│   (View/Edit/ │      │  (Submit form)│   │ (Multi-row)  │
│    Delete)    │      └───────────────┘   └──────────────┘
└───────────────┘                │                  │
        │                        │                  │
        └────────────────────────┼──────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │   Admin Store       │
                    │  (Zustand)          │
                    │  - State management │
                    │  - API calls        │
                    │  - Error handling   │
                    └─────────────────────┘
                                 │
                                 │
        ┌────────────────────────┼────────────────────┐
        │                        │                    │
        ▼                        ▼                    ▼
┌──────────────┐        ┌──────────────┐     ┌──────────────┐
│  Users API   │        │ Centers API  │     │  Games API   │
│  /api/admin/ │        │  /api/admin/ │     │  /api/admin/ │
│    users     │        │   centers    │     │    games     │
└──────────────┘        └──────────────┘     └──────────────┘
        │                        │                    │
        └────────────────────────┼────────────────────┘
                                 │
                                 ▼
                        ┌──────────────┐
                        │   Database   │
                        │   (Prisma)   │
                        └──────────────┘
```

## Component Interaction Flow

### Example: Creating a New User

```
1. User clicks "Create User" button
         │
         ▼
2. UserModal opens (mode: 'create')
         │
         ▼
3. User fills form and clicks "Save"
         │
         ▼
4. Form validation runs (client-side)
         │
         ├─ Validation fails ─→ Show inline errors
         │
         └─ Validation passes
                  │
                  ▼
5. Modal calls adminStore.createUser()
         │
         ▼
6. Store sets isSubmitting = true
         │
         ▼
7. Store makes API call to POST /api/admin/users
         │
         ├─ API fails ─→ Store sets error, Modal shows error
         │
         └─ API succeeds
                  │
                  ▼
8. Store reloads user list (adminStore.loadUsers())
         │
         ▼
9. Store sets isSubmitting = false
         │
         ▼
10. Modal closes, table updates with new user
         │
         ▼
11. Success message shows (optional)
```

### Example: Bulk User Block

```
1. User selects multiple rows in table
         │
         ▼
2. User clicks "Block Selected" bulk action
         │
         ▼
3. Confirmation dialog appears
         │
         ├─ User cancels ─→ No action
         │
         └─ User confirms
                  │
                  ▼
4. For each selected user:
   - Call adminStore.blockUser(userId)
   - Show progress indicator
         │
         ▼
5. All operations complete
         │
         ▼
6. Table refreshes
         │
         ▼
7. Success message: "5 users blocked"
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AdminStore (Zustand)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  State:                                                 │
│  ├─ games: GameWithInstances[]                         │
│  ├─ centers: CenterWithCoordinator[]                   │
│  ├─ users: UserForAdmin[]                              │
│  ├─ systemStats: SystemStats | null                    │
│  ├─ isLoadingGames: boolean                            │
│  ├─ isLoadingCenters: boolean                          │
│  ├─ isLoadingUsers: boolean                            │
│  ├─ isLoadingStats: boolean                            │
│  ├─ isSubmitting: boolean                              │
│  └─ error: string | null                               │
│                                                         │
│  Actions:                                               │
│  ├─ Game Management                                     │
│  │  ├─ loadGames()                                     │
│  │  ├─ createGame(data)                                │
│  │  ├─ updateGame(id, data)                            │
│  │  └─ deleteGame(id)                                  │
│  │                                                      │
│  ├─ Center Management                                   │
│  │  ├─ loadCenters()                                   │
│  │  ├─ createCenter(data)                              │
│  │  ├─ updateCenter(id, data)                          │
│  │  └─ deleteCenter(id)                                │
│  │                                                      │
│  ├─ User Management                                     │
│  │  ├─ loadUsers()                                     │
│  │  ├─ createUser(data)                                │
│  │  ├─ updateUser(id, data)                            │
│  │  ├─ blockUser(id)                                   │
│  │  ├─ unblockUser(id)                                 │
│  │  └─ assignRole(data)                                │
│  │                                                      │
│  └─ System                                              │
│     ├─ loadSystemStats()                               │
│     └─ setError(error)                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Table Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DataTable<TData>                           │
│  (Generic reusable table component)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Props:                                                     │
│  ├─ data: TData[]                                          │
│  ├─ columns: ColumnDef<TData>[]                           │
│  ├─ searchKey: string                                      │
│  ├─ filters?: FilterConfig[]                              │
│  ├─ enableRowSelection?: boolean                          │
│  └─ ... (see spec for complete list)                      │
│                                                             │
│  Internal State:                                            │
│  ├─ sorting: SortingState                                 │
│  ├─ columnFilters: ColumnFiltersState                     │
│  ├─ rowSelection: RowSelectionState                       │
│  └─ pagination: PaginationState                           │
│                                                             │
│  Children:                                                  │
│  ├─ DataTableToolbar                                       │
│  │  ├─ Search input                                       │
│  │  ├─ Filter dropdowns                                   │
│  │  └─ Bulk action buttons                               │
│  │                                                         │
│  ├─ Table (shadcn/ui)                                      │
│  │  ├─ TableHeader                                        │
│  │  │  └─ Column headers with sort indicators            │
│  │  │                                                     │
│  │  └─ TableBody                                          │
│  │     └─ Rows with selection & actions                  │
│  │                                                         │
│  └─ DataTablePagination                                    │
│     ├─ Page size selector                                 │
│     ├─ Page info (showing X of Y)                         │
│     └─ Previous/Next buttons                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Modal Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Modal (Base Component)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Backdrop (click to close)                          │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Modal Container                             │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │  Close Button (✕)                      │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  │                                              │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │  Modal Content (children)              │  │  │  │
│  │  │  │  - Header                              │  │  │  │
│  │  │  │  - Form fields                         │  │  │  │
│  │  │  │  - Action buttons                      │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  │                                              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Features:                                                  │
│  ├─ Portal rendering (to body)                            │
│  ├─ Focus trap                                             │
│  ├─ Escape key handler                                     │
│  ├─ Click outside to close                                │
│  ├─ Body scroll lock                                       │
│  └─ Responsive sizing                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                      Desktop (>1024px)                      │
├─────────────────────────────────────────────────────────────┤
│  Header                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 6-column KPI cards                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Full data table with all columns                      │ │
│  │ - Checkbox | Image | Name | Details | Status | Actions│ │
│  └───────────────────────────────────────────────────────┘ │
│  Centered modals (max-w-2xl)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Tablet (768-1024px)                     │
├─────────────────────────────────────────────────────────────┤
│  Header                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │ KPI cards (3 cols)  │ │                     │          │
│  └─────────────────────┘ └─────────────────────┘          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Table with horizontal scroll                          │ │
│  │ - Essential columns visible                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  Side drawer modals                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Mobile (<768px)                        │
├─────────────────────────────────────────────────────────────┤
│  Header (compact)                                           │
│  ┌─────────────────┐                                       │
│  │ KPI cards       │                                       │
│  │ (1 column)      │                                       │
│  └─────────────────┘                                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Card-based list (replaces table)                      │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ Card 1: User info + actions                       │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ Card 2: User info + actions                       │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│  Bottom sheet modals (full screen)                         │
└─────────────────────────────────────────────────────────────┘
```

## Loading State Progression

```
┌─────────────────────────────────────────────────────────────┐
│          Progressive Loading Timeline                       │
└─────────────────────────────────────────────────────────────┘

0ms ────────────────────────────────────────────────────────→
│
├─ Show page skeleton
│
├─ Start loading system stats
│
200ms ──────────────────────────────────────────────────────→
│
├─ Stats loaded ✓
├─ Show stats cards
├─ Start loading users
│
500ms ──────────────────────────────────────────────────────→
│
├─ Users loaded ✓
├─ Show users table
├─ Start loading centers
│
800ms ──────────────────────────────────────────────────────→
│
├─ Centers loaded ✓
├─ Show centers table
├─ Start loading games
│
1200ms ─────────────────────────────────────────────────────→
│
├─ Games loaded ✓
├─ Show games table
├─ Dashboard fully loaded ✓
│
└─ All data available, interactive

Benefits:
- User sees content in 200ms instead of 1200ms
- Perceived performance is much faster
- Users can start working while data loads
- Mobile users on slow connections benefit most
```

---

## Component Dependencies

```
DataTable
├─ @tanstack/react-table (table logic)
├─ shadcn/ui Table components (UI)
├─ Checkbox (row selection)
├─ Button (actions)
└─ Badge (status displays)

Modal
├─ react-dom (portal)
├─ Lucide React (icons)
└─ Button (actions)

DataTableToolbar
├─ Input (search)
├─ Select (filters)
└─ Button (bulk actions)

UserModal
├─ Modal (base)
├─ Input (form fields)
├─ Checkbox (isActive)
├─ Badge (roles display)
└─ Button (submit)

RoleAssignmentModal
├─ Modal (base)
├─ Select (role + center)
├─ Badge (current roles)
└─ Button (assign)

CenterModal
├─ Modal (base)
├─ Input (name, address)
├─ Select (area, coordinator)
└─ Button (submit)

GameModal
├─ Modal (base)
├─ Input (name, image URL)
├─ Textarea (description)
├─ Checkbox (categories)
├─ Select (audience)
└─ Button (submit)
```

---

This diagram provides a visual reference for understanding how all the components fit together and interact in the admin dashboard system.

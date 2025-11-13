# Admin Users Management - Specification

## 📋 Core Rules

**Access Level: ADMIN ONLY**
- This table is only accessible to users with ADMIN role
- Middleware enforces admin permission at `/api/admin/*` route level
- No per-action permission checks needed within this table

**Validation Strategy: Two-Layer**
1. **User Management**: Flexible - allow incomplete role assignments, show warnings
2. **Center Management**: Strict - active centers MUST have coordinator

**Business Rules:**
- ❌ **HARD**: Active centers must have coordinator
- ⚠️ **SOFT**: Active centers should have super-coordinator (warn only)
- ✅ **ALLOW**: Users can have coordinator roles without assigned centers (temporary)
- ✅ **ALLOW**: Inactive centers don't need coordinators
- ✅ **ALLOW**: Users can have empty roles array (regular user)

---

## 📊 Table Features

### Columns
| Column | Sortable | Filterable | Notes |
|--------|----------|------------|-------|
| Name | ✅ | ✅ Text | `formatUserName(firstName, lastName)` |
| Email | ✅ | ✅ Text | Unique identifier |
| Phone | ❌ | ✅ Text | Optional |
| Role | ✅ | ✅ Dropdown | Show all roles
| Center | ✅ | ✅ Text | Managed center name (for coordinators), "-" otherwise |
| Actions | ❌ | ❌ | View, Edit |

**Table Header Actions:**
- Create User button (opens create modal)

---

## 🔄 User Actions

### 1. View Details (פרטים)
**Modal shows:**
- Personal info (name, email, phone)
- All roles (not just main one)
- Center assignments (managed + supervised)
- Creation date
- ⚠️ Warnings if coordinator without centers

### 2. Edit User (ערוך)
**Editable:** `firstName`, `lastName`, `phone`, `roles`
**Non-editable:** `email`

**API checks:**
- Field validation (length, format)
- Phone regex validation
- ❌ **Block** if removing `CENTER_COORDINATOR` role while `managedCenter` exists
- ❌ **Block** if removing `SUPER_COORDINATOR` role while `supervisedCenters` exist
- ✅ **Allow** empty roles array (user becomes regular user)

**Role Assignment Matrix:**

| Role | Center Required | Action |
|------|-----------------|--------|
| ADMIN | ❌ No | Allow |
| CENTER_COORDINATOR | ⚠️ Optional | Allow, warn if no center assigned via Centers management |
| SUPER_COORDINATOR | ⚠️ Optional | Allow, warn if no centers assigned via Centers management |
| Regular user (no roles) | ❌ No | Allow |

**Note:** Center assignments are now managed exclusively in the Centers table, not in User Edit modal.

### 3. Create User (הוספת משתמש)
**Form fields:**
- First Name * (required)
- Last Name * (required)
- Email * (required, unique)
- Phone * (required)
- Password * (required, min 8 chars)
- Roles (multi-select, optional - empty = regular user)
- Managed center (if CENTER_COORDINATOR selected)
  - **Show only**: Centers without coordinator
- Supervised centers (if SUPER_COORDINATOR selected)
  - **Show only**: Centers without super-coordinator

**API must check:**
1. ❌ **Block** if email already exists
2. ⚠️ **Warn** if phone already exists
3. ⚠️ **Warn** if CENTER_COORDINATOR without managedCenterId
4. ⚠️ **Warn** if SUPER_COORDINATOR without supervisedCenterIds
5. ❌ **Block** if user without roles has center assignments

**Auto-set:**
- `isActive: true` (all new users active by default)
- Password hashed with bcrypt

---

## 🔍 Search & Filters

**Global Search:** Name (combined firstName + lastName)

**Column Filters (Client-Side):**
- Name: substring match
- Email: substring match
- Phone: substring match
- Role: exact match (dropdown)
- Center: substring match (text)

**Note:** All filtering happens client-side on loaded data. API returns all users.

---

## 📡 API Specifications

### GET /api/admin/users
**Returns:** All users with center assignments

**No query params:** API returns all users, filtering done client-side

### POST /api/admin/users
**Creates:** New user with roles and center assignments

**Required fields:**
- firstName, lastName, email, phone, password

**Optional fields:**
- roles (array, empty = regular user)
- managedCenterId (if CENTER_COORDINATOR role)
- supervisedCenterIds (if SUPER_COORDINATOR role)

**Must check:**
1. ❌ **Block** if email already exists
2. ⚠️ **Warn** if phone already exists
3. ⚠️ **Warn** if CENTER_COORDINATOR without managedCenterId
4. ⚠️ **Warn** if SUPER_COORDINATOR without supervisedCenterIds
5. ❌ **Block** if user without roles has center assignments

**Auto-set:** `isActive: true`, password hashed

**Schema:** `CreateUserSchema`

### PUT /api/admin/users/[id]
**Updates:** Personal info and roles - partial update

**Editable fields:**
- `firstName` (optional)
- `lastName` (optional)
- `phone` (optional)
- `roles` (optional - can be empty array)

**Validation:**
- At least one field must be provided
- Phone format regex (if provided)
- Name length limits 1-50 (if provided)

**Must check:**
1. ❌ **Block** if removing `CENTER_COORDINATOR` while user has `managedCenter`
   - Error: `"Cannot remove CENTER_COORDINATOR role: user manages center "{name}". Please reassign the center first."`
2. ❌ **Block** if removing `SUPER_COORDINATOR` while user has `supervisedCenters`
   - Error: `"Cannot remove SUPER_COORDINATOR role: user supervises {count} center(s): {names}. Please reassign the centers first."`

**Cannot change:** `email`, `isActive`

**Schema:** `UpdateUserByAdminSchema` (partial - firstName, lastName, phone, roles)

**Note:** This endpoint now handles role updates. The separate role assignment endpoint has been removed.

---

## ⚠️ Critical Edge Cases

| Scenario | Validation | Action |
|----------|------------|--------|
| Coordinator without center | Allow | No warning - managed in Centers table |
| Super without centers | Allow | No warning - managed in Centers table |
| Remove coordinator with managedCenter | Block | Must reassign center first |
| Remove super with supervisedCenters | Block | Must reassign centers first |
| User with no roles | Allow | Regular user without special permissions |

---

## 🧪 Testing Checklist

### API Tests (Must Cover)
- [ ] GET users - returns all users with center assignments
- [ ] POST user - creates new user successfully
- [ ] POST user - blocks duplicate email
- [ ] POST user - warns if phone already exists
- [ ] POST user - warns if coordinator without center
- [ ] POST user - blocks user without roles with centers
- [ ] PUT user - updates personal info (partial)
- [ ] PUT user - updates roles successfully
- [ ] PUT user - allows empty roles array
- [ ] PUT user - blocks removing CENTER_COORDINATOR with managedCenter
- [ ] PUT user - blocks removing SUPER_COORDINATOR with supervisedCenters
- [ ] PUT user - rejects invalid phone
- [ ] PUT user - requires at least one field
- [ ] UI only shows available centers (without coordinators)

### UI Tests (Must Cover)
- [ ] Create user modal opens and closes
- [ ] Create user with all fields works
- [ ] Create user shows warnings for incomplete role assignments
- [ ] Search by name
- [ ] Filter by role
- [ ] Filter by center
- [ ] View details shows all user information
- [ ] Edit modal shows role checkboxes
- [ ] Edit updates personal info and roles
- [ ] Edit shows error when trying to remove coordinator role with assigned center
- [ ] Error messages are displayed and cleared properly

---

## 📋 Validation Summary

### User Validations (Flexible)
```
✅ Allow coordinator roles without centers (managed in Centers table)
✅ Allow same person to be coordinator + super for same center
✅ Allow users with no roles (regular user)
⚠️ Show warnings for incomplete assignments during user creation
❌ Block removing CENTER_COORDINATOR if managedCenter exists
❌ Block removing SUPER_COORDINATOR if supervisedCenters exist
```

### Center Validations (Strict - enforced in Centers table)
```
❌ Cannot activate center without coordinator
⚠️ Warn if active center without super
✅ Allow inactive center without coordinators
```

---

## 🎯 Types & Schemas Summary

### API Input (Validation Schemas)
**From `/lib/validations.ts`:**
- `CreateUserSchema` - POST /api/admin/users
- `UpdateUserByAdminSchema` - PUT /api/admin/users/[id] (partial - firstName, lastName, phone, roles)


### API Output (Response Types)
**From `/types/computed.ts`:**
- `UserForAdmin` - All endpoints return this type
- `CenterForAdmin[]` - Passed to modals for center selection

### Enums
**From `/types/schema.ts`:**
- `Role` - ADMIN | CENTER_COORDINATOR | SUPER_COORDINATOR

---

## 🛠️ Implementation Guidelines

### Component Structure
```
src/app/admin/
└── page.tsx                           # Admin dashboard with tabs

src/components/admin/
├── users/                             # User management (this feature)
│   ├── user-management-table.tsx      # Main table
│   ├── modals/
│   │   ├── create-user-modal.tsx      # Create user
│   │   ├── edit-user-modal.tsx        # Edit personal info + roles
│   │   └── user-details-modal.tsx     # View details
│   └── index.ts                       # Exports
│
├── centers/                           # Center management (future)
│   ├── center-management-table.tsx
│   ├── modals/
│   └── index.ts
│
├── games/                             # Game management (future)
│   ├── game-management-table.tsx
│   ├── modals/
│   └── index.ts
│
└── shared/                            # Shared admin components
    ├── modals/
    │   └── base-form-modal.tsx        # Reusable modal wrapper
    └── forms/
        ├── role-selector.tsx          # Multi-select roles
        ├── center-selector.tsx        # Single/multi center dropdown
        ├── area-selector.tsx          # Area dropdown
        └── coordinator-selector.tsx   # Coordinator dropdown
```

**Note:** `assign-role-modal.tsx` has been removed - role editing is now part of `edit-user-modal.tsx`

### Page Structure
**`/app/admin/page.tsx`** - Admin dashboard with tabs:
- Uses Radix UI Tabs component
- Tabs: Users | Centers | Games | Stats
- Loads data with `useAdminStore`
- Protected by middleware (admin only)

### Global UI Components
```
src/components/ui/                     # Shadcn/Radix components
├── data-table.tsx                     # Table with sorting/filtering
├── dialog.tsx                         # Modal dialogs
├── button.tsx, input.tsx, select.tsx  # Form inputs
└── badge.tsx, card.tsx, etc.          # UI elements
```

### Libraries & Tools
- `@tanstack/react-table` - Tables
- `@radix-ui` - UI primitives
- `react-hook-form` - Forms
- `zod` - Validation
- `zustand` - State (`/store/admin-store.ts`)

### Utilities
- `/lib/utils.ts` - formatUserName, etc.
- `/lib/labels.ts` - getRoleLabel
- `/lib/api-response.ts` - API wrapper
- `/lib/validations.ts` - Zod schemas

### Development Order
1. APIs → 2. Store → 3. Modals → 4. Table → 5. Filters

### Key Rules
✅ Modular structure (users/centers/games separate)
✅ Reuse shared components from `/admin/shared/`
✅ Client-side filtering only
✅ Show warnings as notifications
✅ Roles edited directly in Edit User modal
❌ No server-side filtering
❌ No new UI primitives
❌ No separate role assignment modal

---

**Last Updated:** 2025-11-13
**Status:** ✅ Updated - Role editing integrated into Edit User modal
**Key Decision:** Flexible user assignments + Strict center activation + Role management in Edit modal

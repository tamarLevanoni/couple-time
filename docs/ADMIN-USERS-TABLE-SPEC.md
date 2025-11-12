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
| Actions | ❌ | ❌ | View, Edit, Role |

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
**Editable:** `firstName`, `lastName`, `phone`
**Non-editable:** email, roles

**API checks:**
- Field validation (length, format)
- Phone regex validation

### 3. Assign Role (תפקיד)
**Form fields:**
- Roles (multi-select, min 1)
- Managed center (if CENTER_COORDINATOR selected)
  - **Show only**: Centers without coordinator OR this user's current managed center
- Supervised centers (if SUPER_COORDINATOR selected)
  - **Show only**: Centers without super-coordinator OR centers this user currently supervises
  - **Note**: Each center has max ONE super (many-to-one relation)

**API must check:**
1. ⚠️ **Warn** if CENTER_COORDINATOR without `managedCenterId`
2. ⚠️ **Warn** if SUPER_COORDINATOR without `supervisedCenterIds`
3. ❌ **Block** if regular user has center assignments
4. ❌ **Block** if removing ADMIN role from self (cannot demote yourself)
5. ⚠️ **Warn** if removing coordinator from center with active rentals

**Role Assignment Matrix:**

| Role | Center Required | Action |
|------|-----------------|--------|
| ADMIN | ❌ No | Allow |
| CENTER_COORDINATOR | ⚠️ Optional | Allow, warn if null |
| SUPER_COORDINATOR | ⚠️ Optional | Allow, warn if empty |
| Regular user | ❌ No | Clear all assignments |

### 4. Create User (הוספת משתמש)
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
**Updates:** Personal info (firstName, lastName, phone) - partial update

**Validation:**
- At least one field must be provided
- Phone format regex (if provided)
- Name length limits 1-50 (if provided)

**Cannot change:** email, roles, status

**Schema:** `UpdateUserByAdminSchema` (partial)

### PUT /api/admin/users/[id]/role
**Updates:** User roles and center assignments

**Must check:**
1. Roles array not empty
2. ❌ **Block** if regular user has center assignments
3. ⚠️ **Warn** if CENTER_COORDINATOR without managedCenterId
4. ⚠️ **Warn** if SUPER_COORDINATOR without supervisedCenterIds
5. ❌ **Block** if removing ADMIN role from self
6. ⚠️ **Warn** if removing coordinator with active rentals

**Schema:** `AssignRoleSchema`

---

## ⚠️ Critical Edge Cases

| Scenario | Validation | Action |
|----------|------------|--------|
| Coordinator without center | Warn | Allow, show warning |
| Super without centers | Warn | Allow, show warning |
| Remove coordinator + active rentals | Warn + Confirm | Allow after confirm |
| Remove ADMIN from self | Block | Cannot demote yourself |
| Regular user with centers | Block | Clear centers first |

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
- [ ] PUT user - rejects invalid phone
- [ ] PUT user - requires at least one field
- [ ] PUT role - assigns coordinator without center (warns)
- [ ] PUT role - blocks removing ADMIN from self
- [ ] UI only shows available centers (without coordinators)

### UI Tests (Must Cover)
- [ ] Create user modal opens and closes
- [ ] Create user with all fields works
- [ ] Create user shows warnings for incomplete role assignments
- [ ] Search by name
- [ ] Filter by role
- [ ] Filter by center
- [ ] View details shows warnings
- [ ] Edit updates personal info
- [ ] Assign role shows warnings for incomplete assignments

---

## 📋 Validation Summary

### User Validations (Flexible)
```
✅ Allow coordinator roles without centers (warn)
✅ Allow same person to be coordinator + super for same center
⚠️ Show warnings for incomplete assignments
❌ Block regular user with center assignments
❌ Block removing ADMIN from self
⚠️ Confirm if removing coordinator with active rentals
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
- `UpdateUserByAdminSchema` - PUT /api/admin/users/[id] (partial - firstName, lastName, phone)
- `AssignRoleSchema` - PUT /api/admin/users/[id]/role

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
│   │   ├── edit-user-modal.tsx        # Edit personal info
│   │   ├── assign-role-modal.tsx      # Assign roles + centers
│   │   └── user-details-modal.tsx     # View details + warnings
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
❌ No server-side filtering
❌ No new UI primitives

---

**Last Updated:** 2025-11-13
**Status:** ✅ Ready for Implementation
**Key Decision:** Flexible user assignments + Strict center activation

# Admin Centers Management - Specification

## 📋 Core Rules

**Access Level: ADMIN ONLY**
- Middleware enforces admin permission at `/api/admin/*` route level

**Validation Strategy: Strict**
- ❌ **HARD**: Active centers must have coordinator
- ⚠️ **SOFT**: Active centers should have super-coordinator (warn only)
- ✅ **ALLOW**: Inactive centers without coordinators
- ✅ **ALLOW**: Creating center without coordinator (auto-sets inactive)
- ❌ **HARD**: Cannot delete center with borrowed games

---

## 📊 Table Features

### Columns
| Column | Sortable | Filterable | Notes |
|--------|----------|------------|-------|
| Name | ✅ | ✅ Text | Center name |
| Area | ✅ | ✅ Dropdown | Hebrew labels via `getAreaLabel()` |
| Coordinator | ✅ | ✅ Text | `formatUserName()`, "-" if none |
| Super Coordinator | ✅ | ✅ Text | Super name, "-" if none |
| Games | ✅ | ❌ | Count of game instances |
| Status | ✅ | ✅ Dropdown | Active/Inactive badge |
| Actions | ❌ | ❌ | View, Edit |

**No Pagination:** Load all centers, client-side filtering only

---

## 🔄 Center Actions

### 1. View Details (פרטים)
- Center info: name, area, status, location, creation date
- Coordinator/Super details (name, email, phone) or "Not assigned"
- Statistics: total games, active rentals, total rentals
- ⚠️ Warnings if active center without super

### 2. Edit Center (ערוך)
**Editable:** `name`, `area`, `coordinatorId`, `superCoordinatorId`, `isActive`, `location`

**Key Validations:**
- ❌ **Block** if activating without coordinator
- ⚠️ **Warn** if activating without super
- ❌ **Block** if coordinator already manages another center
- Auto-deactivate if removing coordinator from active center

**Coordinator Selection:**
- **Show only**: Users with `CENTER_COORDINATOR` role AND no `managedCenter` AND `isActive: true`
- Can remove (sets to null, auto-deactivates center if active)

**Super Coordinator Selection:**
- Filter: Users with `SUPER_COORDINATOR` role, `isActive: true`
- Can remove (shows warning if center active)

### 3. Create Center (הוספת מרכז)
**Required:** name (1-100 chars), area

**Optional:** coordinatorId, superCoordinatorId, location

**Auto-set:** `isActive: true` if coordinator provided, `false` otherwise

**Validations:**
- ❌ **Block** if name exists (database enforces uniqueness via `@unique` constraint)
- ❌ **Block** if invalid coordinator (wrong role, inactive, manages another center)
- ⚠️ **Warn** if coordinator without super

---

## 🔄 Critical Coordinator Assignment Scenarios

### Scenario 1: Assign Coordinator
1. **Dropdown shows only**: Users with `CENTER_COORDINATOR` role AND no `managedCenter` AND `isActive: true`
2. API validates coordinator availability (double-check they don't manage another center)
3. Updates `coordinatorId`, user's `managedCenter` auto-updates
4. Can toggle `isActive: true` if coordinator assigned

**Edge Cases:**
- ❌ Coordinator already manages another center → Block (shouldn't appear in dropdown)
- ❌ User doesn't have CENTER_COORDINATOR role → Block (shouldn't appear in dropdown)

### Scenario 2: Remove Coordinator
1. Clear coordinator selection (set to null)
2. If center active → Auto-deactivate (`isActive: false`)
3. User's `managedCenter` becomes null automatically
4. ⚠️ Warning: "Removing coordinator will deactivate the center"

### Scenario 3: Change Coordinator
1. Select different coordinator
2. API validates new coordinator
3. Old coordinator's `managedCenter` → null
4. New coordinator's `managedCenter` → this center

### Scenario 4: Activate Center
1. Toggle `isActive: true`
2. ❌ **Block** if no coordinator
3. ⚠️ **Warn** if no super
4. Center activates if valid

### Scenario 5: Cross-table Validation
- User table blocks removing CENTER_COORDINATOR role if `managedCenter` exists
- Must first remove coordinator from center, then remove role from user

---

## 📡 API Specifications

### GET /api/admin/centers
**Returns:** All centers with coordinators, supers, and stats

**Query Pattern:** Uses `CENTERS_FOR_ADMIN` include

**No pagination** - client-side filtering only

### POST /api/admin/centers
**Required:** name, area

**Optional:** coordinatorId, superCoordinatorId, location

**Validations:**
- ❌ Block duplicate name (database enforces uniqueness via `@unique` constraint)
- ❌ Block invalid coordinator (wrong role, inactive, manages another center)
- ⚠️ Warn if coordinator without super

**Auto-set:** `isActive: true` if coordinator provided, `false` otherwise

**Schema:** `CreateCenterSchema`

### PUT /api/admin/centers/[id]
**Editable:** name, area, coordinatorId, superCoordinatorId, location, isActive (all optional)

**Validations:**
- At least one field required
- ❌ Block duplicate name (database enforces uniqueness via `@unique` constraint)
- ❌ Block activating without coordinator
- ❌ Block if coordinator manages another center
- ⚠️ Warn activating without super
- Auto-deactivate if removing coordinator from active center

**Schema:** `UpdateCenterSchema` (partial)

### DELETE /api/admin/centers/[id]
**Soft delete:** Sets `isActive: false`

**Validation:**
- ❌ Block if borrowed games exist (status='BORROWED')

**Note:** Coordinator/super assignments remain for historical data

---

## ⚠️ Critical Edge Cases

| Scenario | Validation | Action |
|----------|------------|--------|
| Activate without coordinator | Block | Must assign coordinator first |
| Activate without super | Warn | Allow with warning |
| Remove coordinator from active center | Auto-deactivate | Set isActive=false, warn |
| Coordinator manages another center | Block | One-to-one enforced |
| Delete with borrowed games | Block | Must return games first |
| Change coordinator | Allow | Updates both users' managedCenter |
| Create without coordinator | Allow | Auto-sets inactive |
| Remove role while managing center | Block | Must reassign in Centers table first |

---

## 🧪 Testing Checklist

### API Tests
- [ ] GET returns all centers with stats
- [ ] POST creates center, blocks duplicate name
- [ ] POST validates coordinator (role, active, not managing another center)
- [ ] POST auto-sets active/inactive based on coordinator
- [ ] PUT updates fields (partial), blocks activation without coordinator
- [ ] PUT auto-deactivates when removing coordinator
- [ ] PUT allows changing coordinator
- [ ] DELETE soft deletes, blocks if borrowed games exist
- [ ] Coordinator assignment updates user's managedCenter

### UI Tests
- [ ] Create/Edit modals work, show proper validations
- [ ] Search and filters (name, area, status, coordinator)
- [ ] View details shows all info and warnings
- [ ] Coordinator/super dropdowns show filtered users only
- [ ] Status badge colors (green=active, gray=inactive)

### Integration Tests
- [ ] Cannot remove CENTER_COORDINATOR role if managedCenter exists
- [ ] User's managedCenter updates/clears with center assignments

---

## 🎯 Types & Schemas

**From `/lib/validations.ts`:**
- `CreateCenterSchema` - Required: name, area; Optional: coordinatorId, superCoordinatorId, location
- `UpdateCenterSchema` - All fields partial, at least one required

**From `/types/computed.ts`:**
- `CenterForAdmin` - includes coordinator, superCoordinator, stats

**From `/types/models.ts`:**
- `CENTERS_FOR_ADMIN` - Query include pattern
- `CENTER_BASIC_FIELDS` - Query select pattern

**Enums:**
- `Area` - NORTH | CENTER | SOUTH | JERUSALEM | JUDEA_SAMARIA

---

## 🛠️ Implementation

### Component Structure
```
src/components/admin/centers/
├── center-management-table.tsx
├── modals/
│   ├── create-center-modal.tsx
│   ├── edit-center-modal.tsx
│   └── center-details-modal.tsx
└── index.ts
```

### Development Order
1. Store - Add center actions to `admin-store.ts`
2. Modals - Create, Edit, View (use `BaseFormModal`)
3. Table - Columns, sorting, filtering
4. Integration - Connect to admin dashboard tabs
5. Testing - API + UI tests

### Key Patterns
✅ Reuse `/components/admin/shared/` components
✅ Client-side filtering only
✅ Use `BaseFormModal` for modals
✅ Warnings via sonner toast
✅ Hebrew labels via `getAreaLabel()`
✅ **Filter coordinators**: `CENTER_COORDINATOR` role AND no `managedCenter` AND `isActive: true`
✅ **Filter supers**: `SUPER_COORDINATOR` role AND `isActive: true`

---

## 🗄️ Database Schema Notes

**Center Name Uniqueness:**
- `Center.name` field has `@unique` constraint at database level
- Prisma error code `P2002` is caught and handled with user-friendly message
- No need for manual duplicate checks in application code

---

**Last Updated:** 2025-11-13
**Status:** ✅ MVP Specification Complete
**No Pagination:** Client-side filtering for all centers

# Admin Games Management - Specification

## 📋 Core Rules

**Access Level: ADMIN ONLY**
- This table is only accessible to users with ADMIN role
- Middleware enforces admin permission at `/api/admin/*` route level
- No per-action permission checks needed within this table

**Validation Strategy: Simple**
- ✅ **ALLOW**: Creating games without instances (catalog only)
- ✅ **ALLOW**: Editing all game fields (name, description, categories, audiences, images)
- ❌ **HARD**: Cannot delete games with any rentals (BORROWED, AVAILABLE, or UNAVAILABLE)
- ✅ **ALLOW**: Multiple categories and target audiences per game
- ✅ **ALLOW**: Multiple images per game (primary + gallery)

**Business Rules:**
- ❌ **HARD**: Games with rentals cannot be deleted
- ✅ **ALLOW**: Games without rentals can be deleted, and also delete instances
- ✅ **REQUIRE**: At least one category required
- ✅ **REQUIRE**: At least one target audience required
- ✅ **OPTIONAL**: Description and images are optional
- ✅ **OPTIONAL**: Gallery images (unlimited)

---

## 📊 Table Features

### Columns
| Column | Sortable | Filterable | Notes |
|--------|----------|------------|-------|
| Image | ❌ | ❌ | Thumbnail preview (40x40), placeholder if none |
| Name | ✅ | ✅ Text | Game name |
| Categories | ✅ | ✅ Dropdown | Badge display, Hebrew labels via `getGameCategoryLabel()` |
| Target Audiences | ✅ | ✅ Dropdown | Badge display, Hebrew labels via `getTargetAudienceLabel()` |
| Total Instances | ✅ | ❌ | Count across all centers |
| Actions | ❌ | ❌ | View, Edit |

**Table Header Actions:**
- Create Game button (opens create modal)

**No Pagination:** Load all games, client-side filtering only

---

## 🔄 Game Actions

### 1. View Details (פרטים)
**Modal shows:**
- Primary game image (large preview if exists)
- Gallery images (thumbnails, expandable)
- Name and description
- Categories (badges with Hebrew labels)
- Target audiences (badges with Hebrew labels)
- Statistics:
  - Total instances across all centers
  - Available instances count
  - Borrowed instances count
  - Unavailable instances count
- Creation date
- ⚠️ Warning if game has no instances in any center

### 2. Edit Game (ערוך)
**Editable:** `name`, `description`, `categories`, `targetAudiences`, `primaryImageUrl`, `galleryImageUrls`

**Form Fields:**
- Name* (required, 1-100 chars, text input)
- Description (optional, max 1000 chars, textarea)
- Categories* (required, multi-select, at least 1)
- Target Audiences* (required, multi-select, at least 1)
- Primary Image Upload (Cloudinary widget, optional, replaces existing)
- Gallery Images Upload (Cloudinary multi-upload widget, optional, unlimited images)

**Validations:**
- Name: 1-100 characters
- Description: max 1000 characters (optional)
- Categories: at least 1 required
- Target Audiences: at least 1 required
- Primary Image: Valid URL if provided (Cloudinary handles upload)
- Gallery Images: Array of valid URLs (Cloudinary handles uploads)

**No special business logic** - straightforward field updates

### 3. Create Game (הוספת משחק)
**Form fields:**
- Name* (required, 1-100 chars)
- Description (optional, max 1000 chars)
- Categories* (multi-select, at least 1 required)
- Target Audiences* (multi-select, at least 1 required)
- Primary Image Upload (Cloudinary widget, optional)
- Gallery Images Upload (Cloudinary multi-upload widget, optional)

**API must check:**
1. ✅ Name is unique (enforced by DB unique constraint)
2. ✅ At least one category selected
3. ✅ At least one target audience selected
4. ✅ Valid field lengths

**Auto-set:**
- `createdAt`, `updatedAt` (automatic)

**Note:** Creating a game does NOT create instances. Instances are managed separately (future feature or coordinator responsibility).

---

## 🔍 Search & Filters


**Column Filters (Client-Side):**
- Name: substring match
- Categories: exact match (dropdown with all categories)
- Target Audiences: exact match (dropdown with all audiences)

**No server-side filtering:** API returns all games, filtering happens client-side.

---

## 📡 API Specifications

### GET /api/admin/games
**Returns:** All games with instance counts

**Response includes:**
```typescript
{
  success: true,
  data: {
    games: GameWithInstances[],  // Array of games with _count.gameInstances
  }
}
```

**No query params for MVP:** Returns all games, client filters locally

**Type:** `GameWithInstances[]` from `/types/models.ts`

### POST /api/admin/games
**Creates:** New game

**Required fields:**
- `name` (string, 1-100 chars)
- `categories` (array, at least 1)
- `targetAudiences` (array, at least 1)

**Optional fields:**
- `description` (string, max 1000 chars)
- `primaryImageUrl` (string, valid URL from Cloudinary)
- `galleryImageUrls` (array of strings, valid URLs from Cloudinary)

**Validation:** Uses `CreateGameSchema` from `/lib/validations.ts`

**Response:**
```typescript
{
  success: true,
  data: Game  // Created game object
}
```

### PUT /api/admin/games/[id]
**Updates:** Game fields - partial update

**Editable fields (all optional):**
- `name` (string, 1-100 chars)
- `description` (string, max 1000 chars)
- `categories` (array, at least 1 if provided)
- `targetAudiences` (array, at least 1 if provided)
- `primaryImageUrl` (string, valid URL)
- `galleryImageUrls` (array of strings, valid URLs)

**Validation:**
- At least one field must be provided
- Uses `UpdateGameSchema` (partial) from `/lib/validations.ts`

**Response:**
```typescript
{
  success: true,
  data: Game  // Updated game object
}
```

### DELETE /api/admin/games/[id]
**Deletes:** Game (hard delete)

**Validation:**
- ❌ **Block** if game has ANY rentals (borrowed, pending, or returned)
- Error message: `"Cannot delete game with existing rentals."`

**Response:**
```typescript
{
  success: true,
  data: { message: "Game deleted successfully" }
}
```

**Note:** DELETE is implemented in API but NOT exposed in UI for MVP. Can add later if needed.

---

## ⚠️ Critical Edge Cases

| Scenario | Validation | Action |
|----------|------------|--------|
| Create game without instances | Allow | Game exists in catalog, no instances yet |
| Edit game with borrowed instances | Allow | Updates game info, instances unaffected |
| Delete game with any rentals | Block | Must remove all rentals first (coordinator task) |
| Upload image fails | Allow | Game created/updated without image |
| Duplicate game name | Block | DB enforces uniqueness, error P2002 |
| Remove all categories | Block | At least 1 category required |
| Remove all target audiences | Block | At least 1 audience required |

---

## 🧪 Testing Checklist

### API Tests (Must Cover)
- [ ] GET games - returns all games with instance counts
- [ ] GET games - includes _count.gameInstances for each game
- [ ] POST game - creates game successfully with all fields
- [ ] POST game - creates game with only required fields (name, categories, audiences)
- [ ] POST game - blocks if name missing
- [ ] POST game - blocks if categories array empty
- [ ] POST game - blocks if targetAudiences array empty
- [ ] POST game - accepts valid primaryImageUrl
- [ ] POST game - accepts valid galleryImageUrls array
- [ ] POST game - validates URL format for images
- [ ] PUT game - updates game fields (partial)
- [ ] PUT game - allows updating single field
- [ ] PUT game - blocks if no fields provided
- [ ] PUT game - validates field constraints (length, array min)
- [ ] DELETE game - deletes game with no instances
- [ ] DELETE game - blocks deletion if instances exist (any status)
- [ ] DELETE game - returns 404 if game not found

### UI Tests (Must Cover)
- [ ] Table displays all games with correct columns
- [ ] Search by name filters correctly
- [ ] Filter by category works
- [ ] Filter by target audience works
- [ ] Sort by name, categories, audiences, instances
- [ ] View details modal shows all game info
- [ ] View details shows instance statistics
- [ ] Create modal opens and closes
- [ ] Create game with primary image upload works
- [ ] Create game with gallery images upload works
- [ ] Create game without images works
- [ ] Create game validates required fields
- [ ] Edit modal opens with pre-filled data including images
- [ ] Edit modal updates game successfully
- [ ] Edit modal allows replacing primary image
- [ ] Edit modal allows adding/removing gallery images
- [ ] Hebrew labels display correctly for categories/audiences
- [ ] Primary image thumbnails display in table
- [ ] Gallery image count badge displays in table when gallery exists
- [ ] Placeholder image shows when no primary image exists
- [ ] View details shows primary image and gallery thumbnails
- [ ] Gallery images are scrollable and expandable in view details

---

## 📋 Image Upload (Cloudinary Integration)

**Environment variables required:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

**Upload pattern:**
- Primary image: Cloudinary widget (single upload) → `primaryImageUrl`
- Gallery images: Cloudinary widget (multiple: true) → `galleryImageUrls` array

**Display:**
- Table: 40x40 thumbnail + badge showing "+N תמונות" if gallery exists
- View Details: Primary image (300x300) + gallery thumbnails (100x100 scrollable)
- Placeholder: Game icon if no image

---

## 🎯 Types & Schemas Summary

### API Input (Validation Schemas)
**From `/lib/validations.ts`:**
- `CreateGameSchema` - Required: name, categories, targetAudiences; Optional: description, primaryImageUrl, galleryImageUrls
- `UpdateGameSchema` - All fields partial, at least one required

### API Output (Response Types)
**From `/types/models.ts`:**
- `GameWithInstances` - Game with `_count.gameInstances`

**From `/types/computed.ts`:**
- `GameForAdmin` - Enhanced with totalInstances, availableInstances, centerDistribution (future use)

### Enums
**From `/types/schema.ts`:**
- `GameCategory` - COMMUNICATION | INTIMACY | FUN | THERAPY | PERSONAL_DEVELOPMENT
- `TargetAudience` - SINGLES | MARRIED | GENERAL

---

## 🛠️ Implementation Guidelines

### Component Structure
```
src/components/admin/games/
├── game-management-table.tsx
├── modals/
│   ├── create-game-modal.tsx      # Cloudinary upload
│   ├── edit-game-modal.tsx        # Cloudinary upload
│   └── game-details-modal.tsx
└── index.ts

src/components/admin/tabs/
└── games-tab.tsx
```

### Development Order
1. ✅ APIs (already exist)
2. ✅ Store (already exists)
3. 🆕 Add label functions: `getGameCategoryLabel()`, `getTargetAudienceLabel()` to `/lib/labels.ts`
4. 🆕 Create Modals (Create, Edit, View Details) with Cloudinary
5. 🆕 Create Table component
6. 🆕 Create GamesTab wrapper
7. 🆕 Integrate into admin dashboard

### Key Patterns
✅ Follow Users/Centers table pattern
✅ Reuse `BaseFormModal` from `/admin/shared/`
✅ Client-side filtering only
✅ Use Cloudinary upload widget
✅ Hebrew labels via `/lib/labels.ts`
❌ No pagination
❌ No delete UI (API exists but not exposed)

---

**Last Updated:** 2025-11-14
**Status:** ✅ MVP Specification Complete

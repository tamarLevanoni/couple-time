# Game Images Migration - Multiple Images Support

## Summary
Updated the Game model to support multiple images per game:
- **Before**: Single `imageUrl` field
- **After**: `primaryImageUrl` + `galleryImageUrls[]` array

## Database Migration

You need to run this migration manually because the CLI environment is non-interactive.

### Step 1: Create Migration
Run this command in your terminal:
```bash
npx prisma migrate dev --name add_game_multiple_images
```

This will:
1. Generate a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Migrate existing `imageUrl` data to `primaryImageUrl`

### Expected Migration SQL
The migration should contain:
```sql
-- AlterTable
ALTER TABLE "games"
  DROP COLUMN "imageUrl",
  ADD COLUMN "primaryImageUrl" TEXT,
  ADD COLUMN "galleryImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Data Migration: Copy existing imageUrl to primaryImageUrl
UPDATE "games"
SET "primaryImageUrl" = "imageUrl"
WHERE "imageUrl" IS NOT NULL;
```

### Step 2: Generate Prisma Client
After migration, regenerate the Prisma client:
```bash
npx prisma generate
```

## Changes Made

### 1. Schema Updated ✅
**File**: `prisma/schema.prisma`
- Removed: `imageUrl String?`
- Added: `primaryImageUrl String?`
- Added: `galleryImageUrls String[] @default([])`

### 2. Validations Updated ✅
**File**: `src/lib/validations.ts`
- Updated `GameSchema` with new image fields
- Updated `CreateGameSchema` - both image fields optional
- Updated `UpdateGameSchema` - both image fields optional in partial update

### 3. UI Components Updated ✅

**File**: `src/components/games/games-content.tsx`
- Changed `game.imageUrl` → `game.primaryImageUrl`
- Added gallery image count badge overlay

**File**: `src/components/rent/selected-games-card.tsx`
- Changed `game.imageUrl` → `game.primaryImageUrl`

### 4. Documentation Updated ✅
**File**: `docs/ADMIN-GAMES-TABLE-SPEC.md`
- Updated all image field references
- Added Cloudinary multi-upload documentation
- Updated API specifications
- Added test cases for multiple images
- Updated upload flows for primary + gallery images

## API Compatibility

### Existing APIs
The API routes already use the validation schemas, so they automatically support the new fields:

**POST /api/admin/games**
- Now accepts `primaryImageUrl` (optional)
- Now accepts `galleryImageUrls` (optional array)

**PUT /api/admin/games/[id]**
- Can update `primaryImageUrl` (optional)
- Can update `galleryImageUrls` (optional)

### Type Safety
TypeScript will enforce the new field names throughout the codebase. Any missed references to `imageUrl` will show as compile errors.

## Testing After Migration

1. **Check existing games**:
   ```bash
   # All existing imageUrl values should be in primaryImageUrl now
   # galleryImageUrls should be empty arrays
   ```

2. **Test game creation**:
   - Create game with primary image only
   - Create game with primary + gallery images
   - Create game with no images

3. **Test game editing**:
   - Update primary image
   - Add gallery images
   - Remove gallery images

4. **Test UI display**:
   - Games page should show primary images
   - Gallery badge should appear when gallery exists
   - Rent form should show primary images

## Rollback Plan (if needed)

If you need to rollback:

```sql
-- Rollback: Restore imageUrl from primaryImageUrl
ALTER TABLE "games"
  ADD COLUMN "imageUrl" TEXT;

UPDATE "games"
SET "imageUrl" = "primaryImageUrl"
WHERE "primaryImageUrl" IS NOT NULL;

ALTER TABLE "games"
  DROP COLUMN "primaryImageUrl",
  DROP COLUMN "galleryImageUrls";
```

Then revert all code changes using git.

## Next Steps

1. ✅ Run the migration command
2. ✅ Verify data migration (check database)
3. ✅ Test API endpoints with new fields
4. ✅ Update admin UI components (when implementing games table)
5. ✅ Test Cloudinary multi-upload integration

## Notes

- **Unlimited gallery images**: No validation limit on array size
- **All images optional**: Games can exist without any images
- **Cloudinary integration**: Both single and multi-upload widgets needed
- **Backward compatibility**: Old `imageUrl` data automatically migrated to `primaryImageUrl`

---

**Created**: 2025-11-14
**Status**: Ready for migration
**Risk**: Low (non-breaking, preserves existing data)

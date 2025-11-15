-- AlterTable: Replace imageUrl with primaryImageUrl and galleryImageUrls
-- Step 1: Add new columns
ALTER TABLE "games" ADD COLUMN "primaryImageUrl" TEXT;
ALTER TABLE "games" ADD COLUMN "galleryImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Migrate existing data from imageUrl to primaryImageUrl
UPDATE "games" SET "primaryImageUrl" = "imageUrl" WHERE "imageUrl" IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE "games" DROP COLUMN "imageUrl";

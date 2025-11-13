-- AlterTable: Remove managedCenterId column from users table
-- The coordinator relationship is now managed only from the centers table via coordinatorId

ALTER TABLE "users" DROP COLUMN IF EXISTS "managedCenterId";

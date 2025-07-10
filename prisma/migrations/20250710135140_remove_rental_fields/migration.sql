/*
  Warnings:

  - The values [APPROVED,REJECTED] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvedDate` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDashboard` on the `users` table. All the data in the column will be lost.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'RETURNED', 'CANCELLED');
ALTER TABLE "rentals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rentals" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "RentalStatus_old";
ALTER TABLE "rentals" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "approvedDate",
DROP COLUMN "rejectionReason";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "defaultDashboard",
ALTER COLUMN "phone" SET NOT NULL;

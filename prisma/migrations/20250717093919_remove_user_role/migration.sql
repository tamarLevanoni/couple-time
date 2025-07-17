-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('SINGLES', 'MARRIED', 'GENERAL');

-- CreateEnum
CREATE TYPE "GameInstanceStatus" AS ENUM ('AVAILABLE', 'BORROWED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'ACTIVE', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('COMMUNICATION', 'INTIMACY', 'FUN', 'THERAPY', 'PERSONAL_DEVELOPMENT');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('NORTH', 'CENTER', 'SOUTH', 'JERUSALEM', 'JUDEA_SAMARIA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "roles" "Role"[],
    "managedCenterId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleId" TEXT,
    "password" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" "Area" NOT NULL,
    "coordinatorId" TEXT,
    "superCoordinatorId" TEXT,
    "location" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categories" "GameCategory"[],
    "targetAudiences" "TargetAudience"[],
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_instances" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "status" "GameInstanceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "expectedReturnDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3),
    "borrowDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "expectedReturnDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameInstanceToRental" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GameInstanceToRental_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_managedCenterId_key" ON "users"("managedCenterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "centers_coordinatorId_key" ON "centers"("coordinatorId");

-- CreateIndex
CREATE INDEX "centers_coordinatorId_idx" ON "centers"("coordinatorId");

-- CreateIndex
CREATE INDEX "centers_superCoordinatorId_idx" ON "centers"("superCoordinatorId");

-- CreateIndex
CREATE UNIQUE INDEX "game_instances_gameId_centerId_key" ON "game_instances"("gameId", "centerId");

-- CreateIndex
CREATE INDEX "_GameInstanceToRental_B_index" ON "_GameInstanceToRental"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managedCenterId_fkey" FOREIGN KEY ("managedCenterId") REFERENCES "centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centers" ADD CONSTRAINT "centers_superCoordinatorId_fkey" FOREIGN KEY ("superCoordinatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_instances" ADD CONSTRAINT "game_instances_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_instances" ADD CONSTRAINT "game_instances_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameInstanceToRental" ADD CONSTRAINT "_GameInstanceToRental_A_fkey" FOREIGN KEY ("A") REFERENCES "game_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameInstanceToRental" ADD CONSTRAINT "_GameInstanceToRental_B_fkey" FOREIGN KEY ("B") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

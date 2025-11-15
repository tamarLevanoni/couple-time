-- AlterTable: Add unique constraint to Game.name
CREATE UNIQUE INDEX "games_name_key" ON "games"("name");

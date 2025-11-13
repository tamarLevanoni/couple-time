-- AlterTable: Add unique constraint to Center.name
CREATE UNIQUE INDEX "centers_name_key" ON "centers"("name");

-- AlterTable: Add unique constraint to User.phone
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

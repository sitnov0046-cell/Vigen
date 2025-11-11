-- AlterTable
ALTER TABLE "User" ADD COLUMN "publicId" TEXT;

-- Create unique index (partial to allow nulls)
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId") WHERE "publicId" IS NOT NULL;

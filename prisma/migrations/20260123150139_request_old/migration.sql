/*
  Warnings:

  - Changed the type of `ownerId` on the `ApiKey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "ownerId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

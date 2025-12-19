/*
  Warnings:

  - You are about to drop the column `rating` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Provider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "rating",
DROP COLUMN "taxId",
ADD COLUMN     "regem" TEXT;

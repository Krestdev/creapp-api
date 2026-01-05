/*
  Warnings:

  - You are about to drop the column `proof` on the `Reception` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reception" DROP COLUMN "proof",
ADD COLUMN     "Proof" TEXT;

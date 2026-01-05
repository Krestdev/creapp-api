/*
  Warnings:

  - You are about to drop the column `backCode` on the `Bank` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "backCode",
ADD COLUMN     "bankCode" TEXT;

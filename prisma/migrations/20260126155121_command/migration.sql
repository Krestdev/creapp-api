/*
  Warnings:

  - You are about to drop the column `discount` on the `Command` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Command" DROP COLUMN "discount",
ADD COLUMN     "rabaisAmount" INTEGER,
ADD COLUMN     "remiseAmount" INTEGER,
ADD COLUMN     "ristourneAmount" INTEGER;

/*
  Warnings:

  - Added the required column `mark` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "mark" TEXT NOT NULL;

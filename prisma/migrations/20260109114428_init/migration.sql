/*
  Warnings:

  - You are about to drop the column `capacity` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `matricule` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "capacity",
DROP COLUMN "color",
ADD COLUMN     "matricule" TEXT NOT NULL;

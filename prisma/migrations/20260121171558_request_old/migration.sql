/*
  Warnings:

  - Added the required column `rank` to the `Validators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Validators" ADD COLUMN     "rank" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the column `name` on the `Validators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Validators" DROP COLUMN "name",
ALTER COLUMN "validated" SET DEFAULT false;

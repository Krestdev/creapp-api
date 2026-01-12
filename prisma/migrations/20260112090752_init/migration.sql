/*
  Warnings:

  - You are about to drop the column `name` on the `Signatair` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Signatair` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Signatair" DROP COLUMN "name",
DROP COLUMN "path";

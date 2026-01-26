/*
  Warnings:

  - You are about to drop the column `computedNetHT` on the `Command` table. All the data in the column will be lost.
  - You are about to drop the column `computedTTC` on the `Command` table. All the data in the column will be lost.
  - You are about to drop the column `computedVat` on the `Command` table. All the data in the column will be lost.
  - You are about to drop the column `withholdingAmount` on the `Command` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Command" DROP COLUMN "computedNetHT",
DROP COLUMN "computedTTC",
DROP COLUMN "computedVat",
DROP COLUMN "withholdingAmount";

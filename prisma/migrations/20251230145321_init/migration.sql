/*
  Warnings:

  - You are about to drop the column `dateline` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "dateline",
ADD COLUMN     "deadLine" TIMESTAMP(3);

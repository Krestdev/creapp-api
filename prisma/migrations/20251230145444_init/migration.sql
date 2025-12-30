/*
  Warnings:

  - You are about to drop the column `deadLine` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "deadLine",
ADD COLUMN     "deadline" TIMESTAMP(3);

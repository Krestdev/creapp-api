/*
  Warnings:

  - You are about to drop the column `deadline` on the `RequestOld` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RequestOld" DROP COLUMN "deadline",
ADD COLUMN     "dueDate" TIMESTAMP(3);

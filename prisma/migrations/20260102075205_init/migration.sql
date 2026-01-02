/*
  Warnings:

  - You are about to drop the column `dateRange` on the `RequestModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RequestModel" DROP COLUMN "dateRange",
ADD COLUMN     "period" JSONB;

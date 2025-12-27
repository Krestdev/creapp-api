/*
  Warnings:

  - You are about to drop the column `proprity` on the `RequestModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "priority" TEXT;

-- AlterTable
ALTER TABLE "RequestModel" DROP COLUMN "proprity",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal';

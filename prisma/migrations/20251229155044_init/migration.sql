/*
  Warnings:

  - You are about to drop the column `Deliverables` on the `Reception` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeviElement" ADD COLUMN     "receptionId" INTEGER;

-- AlterTable
ALTER TABLE "Reception" DROP COLUMN "Deliverables";

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_receptionId_fkey" FOREIGN KEY ("receptionId") REFERENCES "Reception"("id") ON DELETE SET NULL ON UPDATE CASCADE;

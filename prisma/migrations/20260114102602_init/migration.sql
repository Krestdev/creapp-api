/*
  Warnings:

  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method",
ADD COLUMN     "methodId" INTEGER;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "PayType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

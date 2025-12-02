/*
  Warnings:

  - You are about to drop the column `justification` on the `CommandRequest` table. All the data in the column will be lost.
  - You are about to drop the column `modality` on the `CommandRequest` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `CommandRequest` table. All the data in the column will be lost.
  - You are about to drop the column `submited` on the `CommandRequest` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `CommandRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CommandRequest" DROP COLUMN "justification",
DROP COLUMN "modality",
DROP COLUMN "state",
DROP COLUMN "submited",
DROP COLUMN "totalPrice";

-- AlterTable
ALTER TABLE "Devi" ADD COLUMN     "commandRequestId" INTEGER;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_commandRequestId_fkey" FOREIGN KEY ("commandRequestId") REFERENCES "CommandRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

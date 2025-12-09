/*
  Warnings:

  - A unique constraint covering the columns `[deviId]` on the table `Command` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commandId]` on the table `Devi` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "deviId" INTEGER;

-- AlterTable
ALTER TABLE "Devi" ADD COLUMN     "commandId" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "DeviElement" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Command_deviId_key" ON "Command"("deviId");

-- CreateIndex
CREATE UNIQUE INDEX "Devi_commandId_key" ON "Devi"("commandId");

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

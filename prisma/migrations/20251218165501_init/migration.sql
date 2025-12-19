/*
  Warnings:

  - A unique constraint covering the columns `[providerId,commandRequestId]` on the table `Devi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Devi_providerId_commandRequestId_key" ON "Devi"("providerId", "commandRequestId");

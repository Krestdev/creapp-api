/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_matricule_key" ON "Vehicle"("matricule");

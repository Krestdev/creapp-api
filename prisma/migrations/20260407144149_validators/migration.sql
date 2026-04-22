/*
  Warnings:

  - You are about to drop the column `rank` on the `commandValidator` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[validatorId]` on the table `Command` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "commandValidator" DROP COLUMN "rank";

-- CreateIndex
CREATE UNIQUE INDEX "Command_validatorId_key" ON "Command"("validatorId");

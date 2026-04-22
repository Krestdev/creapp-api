/*
  Warnings:

  - You are about to drop the column `commandId` on the `commandValidator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "commandValidator" DROP COLUMN "commandId";

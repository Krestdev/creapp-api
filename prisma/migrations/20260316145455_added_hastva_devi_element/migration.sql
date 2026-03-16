/*
  Warnings:

  - You are about to drop the column `hasTva` on the `DeviElement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeviElement" DROP COLUMN "hasTva",
ADD COLUMN     "reduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tva" DOUBLE PRECISION NOT NULL DEFAULT 0.1925;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

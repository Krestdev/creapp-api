/*
  Warnings:

  - The `km` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `liters` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DeviElement" ALTER COLUMN "priceProposed" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "km",
ADD COLUMN     "km" INTEGER,
DROP COLUMN "liters",
ADD COLUMN     "liters" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

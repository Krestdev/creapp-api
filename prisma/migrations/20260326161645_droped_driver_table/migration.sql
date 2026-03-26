/*
  Warnings:

  - You are about to drop the column `driverId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `RequestModel` table. All the data in the column will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestModel" DROP CONSTRAINT "RequestModel_driverId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "driverId";

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "RequestModel" DROP COLUMN "driverId";

-- DropTable
DROP TABLE "public"."Driver";

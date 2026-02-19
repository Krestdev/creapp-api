/*
  Warnings:

  - The values [PARTIAL] on the enum `Facturestatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `isPartial` to the `Facture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Facturestatus_new" AS ENUM ('CANCELLED', 'UNPAID', 'PAID');
ALTER TABLE "public"."Facture" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Facture" ALTER COLUMN "status" TYPE "Facturestatus_new" USING ("status"::text::"Facturestatus_new");
ALTER TYPE "Facturestatus" RENAME TO "Facturestatus_old";
ALTER TYPE "Facturestatus_new" RENAME TO "Facturestatus";
DROP TYPE "public"."Facturestatus_old";
ALTER TABLE "Facture" ALTER COLUMN "status" SET DEFAULT 'UNPAID';
COMMIT;

-- AlterTable
ALTER TABLE "Facture" ADD COLUMN     "isPartial" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

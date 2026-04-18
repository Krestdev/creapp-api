-- DropForeignKey
ALTER TABLE "public"."Devi" DROP CONSTRAINT "Devi_commandId_fkey";

-- DropIndex
DROP INDEX "public"."Devi_commandId_key";

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_deviId_fkey" FOREIGN KEY ("deviId") REFERENCES "Devi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

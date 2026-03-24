-- CreateEnum
CREATE TYPE "RequestPayType" AS ENUM ('ov', 'chq', 'cash');

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "RequestModel" ADD COLUMN     "paytype" "RequestPayType",
ADD COLUMN     "selected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transactionId" INTEGER;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

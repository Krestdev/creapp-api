-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "abortedFromPaymentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_abortedFromPaymentId_fkey" FOREIGN KEY ("abortedFromPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

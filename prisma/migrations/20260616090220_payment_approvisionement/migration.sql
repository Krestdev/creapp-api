-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentApproId" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentApproId_fkey" FOREIGN KEY ("paymentApproId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

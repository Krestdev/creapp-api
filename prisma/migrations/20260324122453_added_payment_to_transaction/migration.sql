/*
  Warnings:

  - You are about to drop the column `selected` on the `RequestModel` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `RequestModel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RequestModel" DROP CONSTRAINT "RequestModel_transactionId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentTransactionId" INTEGER,
ADD COLUMN     "selected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "RequestModel" DROP COLUMN "selected",
DROP COLUMN "transactionId";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

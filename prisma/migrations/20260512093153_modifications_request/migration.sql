-- CreateEnum
CREATE TYPE "modifact" AS ENUM ('CANCEL', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- CreateTable
CREATE TABLE "modification" (
    "id" SERIAL NOT NULL,
    "action" "modifact" NOT NULL,
    "description" TEXT,
    "requestId" INTEGER,
    "devisId" INTEGER,
    "commandId" INTEGER,
    "paymentId" INTEGER,
    "transactionId" INTEGER,
    "validatorId" INTEGER,
    "requestorId" INTEGER,
    "decision" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "DeviElement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification" ADD CONSTRAINT "modification_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

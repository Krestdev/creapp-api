/*
  Warnings:

  - You are about to drop the column `commandId` on the `Payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Facturestatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_commandId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "commandId",
ADD COLUMN     "factureId" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- CreateTable
CREATE TABLE "Facture" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "reference" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "proof" TEXT,
    "status" "Facturestatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandId" INTEGER NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facture_reference_key" ON "Facture"("reference");

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

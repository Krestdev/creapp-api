/*
  Warnings:

  - A unique constraint covering the columns `[signatureId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "DocumentCategory" ADD VALUE 'SIGNATURE';

-- AlterEnum
ALTER TYPE "DocumentOwnerType" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signatureId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_signatureId_key" ON "User"("signatureId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

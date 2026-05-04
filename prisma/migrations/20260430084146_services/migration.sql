-- CreateEnum
CREATE TYPE "RequestState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "RequestModel" ADD COLUMN     "decision" "RequestState",
ADD COLUMN     "serviceChiefId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "serviceId" INTEGER,
ADD COLUMN     "serviceUserId" INTEGER;

-- CreateTable
CREATE TABLE "Services" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "headId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Services_headId_key" ON "Services"("headId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_serviceUserId_fkey" FOREIGN KEY ("serviceUserId") REFERENCES "Services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_serviceChiefId_fkey" FOREIGN KEY ("serviceChiefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

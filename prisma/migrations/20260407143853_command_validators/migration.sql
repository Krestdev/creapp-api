-- CreateEnum
CREATE TYPE "ValidatorDecision" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "validatorId" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- CreateTable
CREATE TABLE "commandValidator" (
    "id" SERIAL NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "decision" "ValidatorDecision" NOT NULL DEFAULT 'PENDING',
    "rank" INTEGER NOT NULL,
    "commandId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandValidator_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "commandValidator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandValidator" ADD CONSTRAINT "commandValidator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

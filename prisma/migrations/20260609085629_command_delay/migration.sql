-- CreateEnum
CREATE TYPE "RECEPTIONMODE" AS ENUM ('PARTIAL', 'FULL', 'NONE');

-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "isPayConditionedByReception" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payDelay" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "receptionMode" "RECEPTIONMODE" NOT NULL DEFAULT 'PARTIAL';

-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

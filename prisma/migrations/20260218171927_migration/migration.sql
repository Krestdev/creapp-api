-- AlterTable
ALTER TABLE "Provider" ALTER COLUMN "expireAtacf" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtbanck_attestation" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtcommerce_registre" SET DEFAULT now() + interval '1 year',
ALTER COLUMN "expireAtplan_localisation" SET DEFAULT now() + interval '1 year';

-- AlterTable
ALTER TABLE "RequestModel" ADD COLUMN     "driverId" INTEGER,
ADD COLUMN     "km" TEXT,
ADD COLUMN     "liters" TEXT,
ADD COLUMN     "vehiclesId" INTEGER;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_vehiclesId_fkey" FOREIGN KEY ("vehiclesId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

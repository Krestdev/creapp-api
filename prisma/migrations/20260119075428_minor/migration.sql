-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "driverId" INTEGER;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "picture" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

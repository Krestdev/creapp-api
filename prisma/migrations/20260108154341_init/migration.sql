/*
  Warnings:

  - You are about to drop the column `model` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "model",
ADD COLUMN     "vehiclesId" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RequestType" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,

    CONSTRAINT "RequestType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_vehiclesId_fkey" FOREIGN KEY ("vehiclesId") REFERENCES "Vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

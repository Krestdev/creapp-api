/*
  Warnings:

  - You are about to drop the `Vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_vehiclesId_fkey";

-- DropTable
DROP TABLE "public"."Vehicles";

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_vehiclesId_fkey" FOREIGN KEY ("vehiclesId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

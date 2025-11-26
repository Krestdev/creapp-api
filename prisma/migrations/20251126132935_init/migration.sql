/*
  Warnings:

  - You are about to drop the column `priceProposed` on the `Devi` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Devi` table. All the data in the column will be lost.
  - You are about to drop the column `requestModelId` on the `Devi` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Devi" DROP CONSTRAINT "Devi_requestModelId_fkey";

-- AlterTable
ALTER TABLE "Devi" DROP COLUMN "priceProposed",
DROP COLUMN "quantity",
DROP COLUMN "requestModelId";

-- CreateTable
CREATE TABLE "DeviElement" (
    "id" SERIAL NOT NULL,
    "requestModelId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "priceProposed" INTEGER NOT NULL,
    "deviId" INTEGER NOT NULL,

    CONSTRAINT "DeviElement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviElement" ADD CONSTRAINT "DeviElement_deviId_fkey" FOREIGN KEY ("deviId") REFERENCES "Devi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

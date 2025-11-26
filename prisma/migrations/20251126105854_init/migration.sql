-- AlterTable
ALTER TABLE "RequestModel" ADD COLUMN     "commandId" INTEGER;

-- CreateTable
CREATE TABLE "Devi" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceProposed" INTEGER NOT NULL,
    "proof" TEXT NOT NULL,
    "requestModelId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "Devi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "deliveryDelay" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "hasPenalties" BOOLEAN NOT NULL,
    "penaltyMode" TEXT NOT NULL,
    "amountBase" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devi" ADD CONSTRAINT "Devi_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

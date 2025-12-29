-- CreateTable
CREATE TABLE "Réception" (
    "Reference" TEXT NOT NULL,
    "ProviderId" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,
    "CommandId" INTEGER NOT NULL,
    "Deadline" TIMESTAMP(3) NOT NULL,
    "ReceiptDate" TIMESTAMP(3) NOT NULL,
    "Deliverables" TEXT NOT NULL,
    "Proof" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Réception_pkey" PRIMARY KEY ("Reference")
);

-- AddForeignKey
ALTER TABLE "Réception" ADD CONSTRAINT "Réception_CommandId_fkey" FOREIGN KEY ("CommandId") REFERENCES "Command"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Réception" ADD CONSTRAINT "Réception_ProviderId_fkey" FOREIGN KEY ("ProviderId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "Type" TEXT NOT NULL,
    "fromBankId" INTEGER NOT NULL,
    "toBankId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromBankId_fkey" FOREIGN KEY ("fromBankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toBankId_fkey" FOREIGN KEY ("toBankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

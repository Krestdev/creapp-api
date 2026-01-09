-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "userId" INTEGER,
ADD COLUMN     "validatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

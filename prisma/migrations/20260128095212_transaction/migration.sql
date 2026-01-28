-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "methodId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "PayType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

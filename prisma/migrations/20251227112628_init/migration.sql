-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "requestId" INTEGER;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

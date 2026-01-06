-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "benefId" INTEGER;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_benefId_fkey" FOREIGN KEY ("benefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

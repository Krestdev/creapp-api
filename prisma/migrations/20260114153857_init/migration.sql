-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "signerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

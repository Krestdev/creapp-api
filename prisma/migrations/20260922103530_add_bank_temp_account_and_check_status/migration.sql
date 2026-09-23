-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "isTemporary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tempAccountId" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "checkStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bank_tempAccountId_key" ON "Bank"("tempAccountId");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_tempAccountId_fkey" FOREIGN KEY ("tempAccountId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

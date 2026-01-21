-- AlterTable
ALTER TABLE "RequestOld" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "RequestOld" ADD CONSTRAINT "RequestOld_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "public"."Validator" DROP CONSTRAINT "Validator_userId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "account" TEXT,
ADD COLUMN     "justification" TEXT;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

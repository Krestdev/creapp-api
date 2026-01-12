-- DropForeignKey
ALTER TABLE "public"."PayType" DROP CONSTRAINT "PayType_signatairId_fkey";

-- AlterTable
ALTER TABLE "PayType" ALTER COLUMN "signatairId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PayType" ADD CONSTRAINT "PayType_signatairId_fkey" FOREIGN KEY ("signatairId") REFERENCES "Signatair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

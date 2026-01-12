-- DropForeignKey
ALTER TABLE "public"."PayType" DROP CONSTRAINT "PayType_signatairId_fkey";

-- AddForeignKey
ALTER TABLE "Signatair" ADD CONSTRAINT "Signatair_payTypeId_fkey" FOREIGN KEY ("payTypeId") REFERENCES "PayType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

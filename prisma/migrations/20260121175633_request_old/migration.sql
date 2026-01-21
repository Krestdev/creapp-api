-- DropForeignKey
ALTER TABLE "public"."RequestOld" DROP CONSTRAINT "RequestOld_requestModelId_fkey";

-- AddForeignKey
ALTER TABLE "RequestOld" ADD CONSTRAINT "RequestOld_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

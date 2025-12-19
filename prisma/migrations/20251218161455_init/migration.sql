-- DropForeignKey
ALTER TABLE "public"."RequestModel" DROP CONSTRAINT "RequestModel_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Validator" DROP CONSTRAINT "Validator_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "RequestModel" ADD CONSTRAINT "RequestModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

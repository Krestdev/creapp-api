/*
  Warnings:

  - Made the column `userId` on table `RequestOld` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."RequestOld" DROP CONSTRAINT "RequestOld_userId_fkey";

-- AlterTable
ALTER TABLE "RequestOld" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RequestOld" ADD CONSTRAINT "RequestOld_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

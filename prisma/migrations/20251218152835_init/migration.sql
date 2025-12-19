/*
  Warnings:

  - You are about to drop the column `projectId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_projectId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "projectId";

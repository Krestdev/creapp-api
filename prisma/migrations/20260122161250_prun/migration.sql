/*
  Warnings:

  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestValidation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestValidation" DROP CONSTRAINT "RequestValidation_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestValidation" DROP CONSTRAINT "RequestValidation_validatorId_fkey";

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."Member";

-- DropTable
DROP TABLE "public"."RequestValidation";

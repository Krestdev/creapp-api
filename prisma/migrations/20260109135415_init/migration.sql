/*
  Warnings:

  - Added the required column `type` to the `RequestType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "type" TEXT NOT NULL;

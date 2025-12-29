/*
  Warnings:

  - The primary key for the `Reception` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Reception" DROP CONSTRAINT "Reception_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Reception_pkey" PRIMARY KEY ("id");

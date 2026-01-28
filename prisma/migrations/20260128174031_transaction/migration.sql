/*
  Warnings:

  - You are about to drop the `_singer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_singer" DROP CONSTRAINT "_singer_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_singer" DROP CONSTRAINT "_singer_B_fkey";

-- DropTable
DROP TABLE "public"."_singer";

-- CreateTable
CREATE TABLE "TransactionSigners" (
    "id" SERIAL NOT NULL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TransactionSigners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionSigners" ADD CONSTRAINT "TransactionSigners_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionSigners" ADD CONSTRAINT "TransactionSigners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

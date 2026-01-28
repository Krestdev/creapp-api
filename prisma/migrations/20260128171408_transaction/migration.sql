/*
  Warnings:

  - You are about to drop the column `signerId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_signerId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "signerId";

-- CreateTable
CREATE TABLE "_singer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_singer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_singer_B_index" ON "_singer"("B");

-- AddForeignKey
ALTER TABLE "_singer" ADD CONSTRAINT "_singer_A_fkey" FOREIGN KEY ("A") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_singer" ADD CONSTRAINT "_singer_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

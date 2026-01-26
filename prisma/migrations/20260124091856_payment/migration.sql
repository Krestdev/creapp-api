/*
  Warnings:

  - You are about to drop the column `signerId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_signerId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "signerId",
ADD COLUMN     "signed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_signedby" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_signedby_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_signedby_B_index" ON "_signedby"("B");

-- AddForeignKey
ALTER TABLE "_signedby" ADD CONSTRAINT "_signedby_A_fkey" FOREIGN KEY ("A") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_signedby" ADD CONSTRAINT "_signedby_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

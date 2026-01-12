/*
  Warnings:

  - You are about to drop the column `userId` on the `Signatair` table. All the data in the column will be lost.
  - Added the required column `signatairId` to the `PayType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Signatair" DROP CONSTRAINT "Signatair_payTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Signatair" DROP CONSTRAINT "Signatair_userId_fkey";

-- AlterTable
ALTER TABLE "PayType" ADD COLUMN     "signatairId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Signatair" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_SignatairToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SignatairToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SignatairToUser_B_index" ON "_SignatairToUser"("B");

-- AddForeignKey
ALTER TABLE "PayType" ADD CONSTRAINT "PayType_signatairId_fkey" FOREIGN KEY ("signatairId") REFERENCES "Signatair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SignatairToUser" ADD CONSTRAINT "_SignatairToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Signatair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SignatairToUser" ADD CONSTRAINT "_SignatairToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `Signature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Signature";

-- CreateTable
CREATE TABLE "Signatair" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "payTypeId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,

    CONSTRAINT "Signatair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayType" (
    "id" SERIAL NOT NULL,
    "label" TEXT,

    CONSTRAINT "PayType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Signatair" ADD CONSTRAINT "Signatair_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signatair" ADD CONSTRAINT "Signatair_payTypeId_fkey" FOREIGN KEY ("payTypeId") REFERENCES "PayType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signatair" ADD CONSTRAINT "Signatair_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

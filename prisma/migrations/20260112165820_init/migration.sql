/*
  Warnings:

  - You are about to drop the column `cmdRqstId` on the `Document` table. All the data in the column will be lost.
  - Added the required column `destination` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encoding` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldname` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalname` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `Document` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRACT', 'RECEIPT', 'INVOICE', 'IDENTITY', 'PROOF', 'JUSTIFICATION');

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('PAYMENT', 'RECEPTION', 'PROVIDER', 'TRANSACTION', 'BANK', 'DEVI', 'COMMANDREQUEST');

-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_cmdRqstId_fkey";

-- DropIndex
DROP INDEX "public"."Document_path_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "cmdRqstId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "encoding" TEXT NOT NULL,
ADD COLUMN     "fieldname" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL,
ADD COLUMN     "originalname" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "ownerType" "DocumentOwnerType" NOT NULL,
ADD COLUMN     "role" "DocumentCategory" NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;

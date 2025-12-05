/*
  Warnings:

  - You are about to drop the column `paymentTicketId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `PaymentTicket` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_paymentTicketId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentTicketId",
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "reference" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ongoing',
ALTER COLUMN "description" SET DEFAULT 'Aucun description',
ALTER COLUMN "budget" SET DEFAULT 0;

-- DropTable
DROP TABLE "public"."PaymentTicket";

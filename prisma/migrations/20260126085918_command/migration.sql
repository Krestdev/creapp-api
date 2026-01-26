-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "discount" INTEGER DEFAULT 0,
ADD COLUMN     "keepTaxes" BOOLEAN NOT NULL DEFAULT true;

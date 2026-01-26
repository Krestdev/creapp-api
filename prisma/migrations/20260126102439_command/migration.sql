-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "computedNetHT" INTEGER,
ADD COLUMN     "computedTTC" INTEGER,
ADD COLUMN     "computedVat" INTEGER,
ADD COLUMN     "netToPay" INTEGER,
ADD COLUMN     "withholdingAmount" INTEGER;

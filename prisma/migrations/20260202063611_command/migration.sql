-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "commandFile" TEXT;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "expireAtacf" TIMESTAMP(3),
ADD COLUMN     "expireAtbanck_attestation" TIMESTAMP(3),
ADD COLUMN     "expireAtcarte_contribuable" TIMESTAMP(3),
ADD COLUMN     "expireAtcommerce_registre" TIMESTAMP(3),
ADD COLUMN     "expireAtplan_localisation" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CommandConditions" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT,

    CONSTRAINT "CommandConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CommandToCommandConditions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CommandToCommandConditions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommandToCommandConditions_B_index" ON "_CommandToCommandConditions"("B");

-- AddForeignKey
ALTER TABLE "_CommandToCommandConditions" ADD CONSTRAINT "_CommandToCommandConditions_A_fkey" FOREIGN KEY ("A") REFERENCES "Command"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommandToCommandConditions" ADD CONSTRAINT "_CommandToCommandConditions_B_fkey" FOREIGN KEY ("B") REFERENCES "CommandConditions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

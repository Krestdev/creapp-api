-- CreateTable
CREATE TABLE "RequestTypes" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RequestTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instalments" (
    "id" SERIAL NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "commandId" INTEGER,

    CONSTRAINT "Instalments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Instalments" ADD CONSTRAINT "Instalments_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

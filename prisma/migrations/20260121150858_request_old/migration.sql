-- AlterTable
ALTER TABLE "Validator" ALTER COLUMN "categoryId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Validators" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL,
    "userId" INTEGER,
    "requestModelId" INTEGER,

    CONSTRAINT "Validators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestOld" (
    "id" SERIAL NOT NULL,
    "deadline" TIMESTAMP(3),
    "priority" TEXT,
    "quantity" INTEGER,
    "unit" TEXT,
    "amount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestModelId" INTEGER NOT NULL,

    CONSTRAINT "RequestOld_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Validators" ADD CONSTRAINT "Validators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validators" ADD CONSTRAINT "Validators_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestOld" ADD CONSTRAINT "RequestOld_requestModelId_fkey" FOREIGN KEY ("requestModelId") REFERENCES "RequestModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

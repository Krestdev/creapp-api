-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "justification" TEXT NOT NULL,
    "accountNumber" TEXT,
    "backCode" TEXT,
    "atmCode" TEXT,
    "key" TEXT,
    "phoneNum" TEXT,
    "merchantNum" TEXT,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

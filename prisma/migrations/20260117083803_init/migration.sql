-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "licence" TEXT,
    "idCard" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

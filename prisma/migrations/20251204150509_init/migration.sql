/*
  Warnings:

  - Added the required column `ref` to the `Devi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Devi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `DeviElement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `DeviElement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Devi" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "ref" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DeviElement" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

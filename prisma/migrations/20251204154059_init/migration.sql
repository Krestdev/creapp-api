-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "reference" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateEnum
CREATE TYPE "Signmode" AS ENUM ('BOTH', 'ONE');

-- AlterTable
ALTER TABLE "Signatair" ADD COLUMN     "mode" "Signmode" NOT NULL DEFAULT 'ONE';

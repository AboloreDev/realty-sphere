/*
  Warnings:

  - A unique constraint covering the columns `[leaseId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('NONE', 'IN_ESCROW', 'RELEASED', 'DISPUTED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "escrowReleaseDate" TIMESTAMP(3),
ADD COLUMN     "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "stripePaymentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amountPaid" SET DEFAULT 0,
ALTER COLUMN "paymentDate" DROP NOT NULL,
ALTER COLUMN "paymentStatus" SET DEFAULT 'Pending';

-- CreateIndex
CREATE UNIQUE INDEX "Payment_leaseId_key" ON "Payment"("leaseId");

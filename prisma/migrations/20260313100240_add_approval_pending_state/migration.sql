-- AlterEnum
ALTER TYPE "order_status" ADD VALUE 'AWAITING_APPROVAL';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;

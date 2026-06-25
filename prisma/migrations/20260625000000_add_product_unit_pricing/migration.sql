-- AlterTable
ALTER TABLE "products" ADD COLUMN     "hasUnitOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sleevePrice" DOUBLE PRECISION,
ADD COLUMN     "boxPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "unit" TEXT;

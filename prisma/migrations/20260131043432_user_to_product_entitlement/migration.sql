/*
  Warnings:

  - You are about to drop the `verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "productId" TEXT;

-- DropTable
DROP TABLE "public"."verifications";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_product_entitlements" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,
    "customSku" TEXT,
    "customDescription" TEXT,
    "customUnitCost" DOUBLE PRECISION,
    "customImageUrl" TEXT,

    CONSTRAINT "user_product_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "user_product_entitlements_userId_idx" ON "user_product_entitlements"("userId");

-- CreateIndex
CREATE INDEX "user_product_entitlements_productId_idx" ON "user_product_entitlements"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "user_product_entitlements_userId_productId_key" ON "user_product_entitlements"("userId", "productId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- AddForeignKey
ALTER TABLE "user_product_entitlements" ADD CONSTRAINT "user_product_entitlements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_product_entitlements" ADD CONSTRAINT "user_product_entitlements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

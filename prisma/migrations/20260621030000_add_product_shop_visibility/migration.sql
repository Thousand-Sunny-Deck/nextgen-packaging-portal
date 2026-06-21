-- CreateTable
CREATE TABLE "product_shop_visibility" (
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_shop_visibility_pkey" PRIMARY KEY ("productId","userId")
);

-- CreateIndex
CREATE INDEX "product_shop_visibility_productId_idx" ON "product_shop_visibility"("productId");

-- CreateIndex
CREATE INDEX "product_shop_visibility_userId_idx" ON "product_shop_visibility"("userId");

-- AddForeignKey
ALTER TABLE "product_shop_visibility" ADD CONSTRAINT "product_shop_visibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_shop_visibility" ADD CONSTRAINT "product_shop_visibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

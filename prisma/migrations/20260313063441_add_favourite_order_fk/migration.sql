-- CreateTable
CREATE TABLE "favourite_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favourite_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favourite_orders_orderId_key" ON "favourite_orders"("orderId");

-- CreateIndex
CREATE INDEX "favourite_orders_userId_idx" ON "favourite_orders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favourite_orders_userId_orderId_key" ON "favourite_orders"("userId", "orderId");

-- AddForeignKey
ALTER TABLE "favourite_orders" ADD CONSTRAINT "favourite_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_orders" ADD CONSTRAINT "favourite_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

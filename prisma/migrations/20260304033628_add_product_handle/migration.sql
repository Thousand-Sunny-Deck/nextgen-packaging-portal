/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `handle` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "products_sku_key";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "handle" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_handle_key" ON "products"("handle");

-- CreateIndex
CREATE INDEX "products_handle_idx" ON "products"("handle");

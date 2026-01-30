/*
  Warnings:

  - You are about to drop the column `orderId` on the `billing_addresses` table. All the data in the column will be lost.
  - Added the required column `userId` to the `billing_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingABN` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingAddress` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingEmail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingOrganization` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."billing_addresses" DROP CONSTRAINT "billing_addresses_orderId_fkey";

-- DropIndex
DROP INDEX "public"."billing_addresses_orderId_key";

-- AlterTable
ALTER TABLE "billing_addresses" DROP COLUMN "orderId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "billingABN" TEXT NOT NULL,
ADD COLUMN     "billingAddress" TEXT NOT NULL,
ADD COLUMN     "billingAddressId" TEXT,
ADD COLUMN     "billingEmail" TEXT NOT NULL,
ADD COLUMN     "billingOrganization" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "billing_addresses_userId_idx" ON "billing_addresses"("userId");

-- AddForeignKey
ALTER TABLE "billing_addresses" ADD CONSTRAINT "billing_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

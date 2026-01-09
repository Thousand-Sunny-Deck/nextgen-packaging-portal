/*
  Warnings:

  - You are about to drop the column `customerFirstName` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerLastName` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customerFirstName",
DROP COLUMN "customerLastName";

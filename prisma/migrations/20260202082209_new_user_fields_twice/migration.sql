/*
  Warnings:

  - You are about to drop the column `organisationName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userOnboarded` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "organisationName",
DROP COLUMN "userOnboarded";

/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - Added the required column `organisationName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userOnboarded` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
DROP COLUMN "image",
ADD COLUMN     "organisationName" TEXT NOT NULL,
ADD COLUMN     "userOnboarded" BOOLEAN NOT NULL;

/*
  Warnings:

  - You are about to drop the column `date` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "date",
ADD COLUMN     "nextPayDate" TIMESTAMP(3),
ADD COLUMN     "payDate" TIMESTAMP(3);

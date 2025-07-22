/*
  Warnings:

  - Made the column `subDescription` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "subDescription" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT ;

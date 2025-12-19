/*
  Warnings:

  - Added the required column `campusZone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "campusZone" TEXT NOT NULL,
ADD COLUMN     "deliveryAddress" TEXT NOT NULL;

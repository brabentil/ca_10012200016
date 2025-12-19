/*
  Warnings:

  - You are about to drop the column `campusZone` on the `CampusRider` table. All the data in the column will be lost.
  - You are about to drop the column `campusZone` on the `Delivery` table. All the data in the column will be lost.
  - Added the required column `zoneId` to the `CampusRider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zoneId` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CampusRider_campusZone_idx";

-- DropIndex
DROP INDEX "Delivery_campusZone_idx";

-- AlterTable
ALTER TABLE "CampusRider" DROP COLUMN "campusZone",
ADD COLUMN     "zoneId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "campusZone",
ADD COLUMN     "zoneId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusZone" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneAdjacency" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "adjacentZoneId" TEXT NOT NULL,

    CONSTRAINT "ZoneAdjacency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campus_code_key" ON "Campus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CampusZone_code_key" ON "CampusZone"("code");

-- CreateIndex
CREATE INDEX "CampusZone_campusId_idx" ON "CampusZone"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "CampusZone_campusId_code_key" ON "CampusZone"("campusId", "code");

-- CreateIndex
CREATE INDEX "ZoneAdjacency_zoneId_idx" ON "ZoneAdjacency"("zoneId");

-- CreateIndex
CREATE INDEX "ZoneAdjacency_adjacentZoneId_idx" ON "ZoneAdjacency"("adjacentZoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ZoneAdjacency_zoneId_adjacentZoneId_key" ON "ZoneAdjacency"("zoneId", "adjacentZoneId");

-- CreateIndex
CREATE INDEX "CampusRider_zoneId_idx" ON "CampusRider"("zoneId");

-- CreateIndex
CREATE INDEX "Delivery_zoneId_idx" ON "Delivery"("zoneId");

-- CreateIndex
CREATE INDEX "Delivery_riderId_idx" ON "Delivery"("riderId");

-- AddForeignKey
ALTER TABLE "CampusZone" ADD CONSTRAINT "CampusZone_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoneAdjacency" ADD CONSTRAINT "ZoneAdjacency_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "CampusZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoneAdjacency" ADD CONSTRAINT "ZoneAdjacency_adjacentZoneId_fkey" FOREIGN KEY ("adjacentZoneId") REFERENCES "CampusZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusRider" ADD CONSTRAINT "CampusRider_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "CampusZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "CampusZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

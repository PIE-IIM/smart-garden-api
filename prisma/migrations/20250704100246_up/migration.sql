/*
  Warnings:

  - You are about to drop the `VagetableImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VagetableImage" DROP CONSTRAINT "VagetableImage_vegetableId_fkey";

-- DropTable
DROP TABLE "VagetableImage";

-- CreateTable
CREATE TABLE "VegetableImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "vegetableId" TEXT NOT NULL,

    CONSTRAINT "VegetableImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VegetableImage_vegetableId_key" ON "VegetableImage"("vegetableId");

-- AddForeignKey
ALTER TABLE "VegetableImage" ADD CONSTRAINT "VegetableImage_vegetableId_fkey" FOREIGN KEY ("vegetableId") REFERENCES "Vegetable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

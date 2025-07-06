/*
  Warnings:

  - The primary key for the `VegetableImage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "VegetableImage" DROP CONSTRAINT "VegetableImage_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VegetableImage_pkey" PRIMARY KEY ("id");

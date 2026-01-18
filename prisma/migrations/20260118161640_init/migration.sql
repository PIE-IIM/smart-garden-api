/*
  Warnings:

  - You are about to drop the column `plant` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "plant",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gardenDataId" TEXT,
ADD COLUMN     "plantId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "GardenVegetable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_gardenDataId_fkey" FOREIGN KEY ("gardenDataId") REFERENCES "GardenData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

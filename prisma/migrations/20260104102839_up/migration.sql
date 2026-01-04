-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" TEXT;

-- CreateTable
CREATE TABLE "GardenData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GardenData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GardenData_userId_key" ON "GardenData"("userId");

-- AddForeignKey
ALTER TABLE "GardenData" ADD CONSTRAINT "GardenData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

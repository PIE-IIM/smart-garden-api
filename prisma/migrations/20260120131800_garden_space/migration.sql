-- CreateTable
CREATE TABLE "GardenSpace" (
    "id" TEXT NOT NULL,
    "spaceName" TEXT NOT NULL,
    "area" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GardenSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GardenSpace_userId_idx" ON "GardenSpace"("userId");

-- AddForeignKey
ALTER TABLE "GardenSpace" ADD CONSTRAINT "GardenSpace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

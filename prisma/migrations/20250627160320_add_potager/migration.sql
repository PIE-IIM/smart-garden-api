-- CreateTable
CREATE TABLE "Potager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vegetableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Potager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Potager_userId_vegetableId_key" ON "Potager"("userId", "vegetableId");

-- AddForeignKey
ALTER TABLE "Potager" ADD CONSTRAINT "Potager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Potager" ADD CONSTRAINT "Potager_vegetableId_fkey" FOREIGN KEY ("vegetableId") REFERENCES "Vegetable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

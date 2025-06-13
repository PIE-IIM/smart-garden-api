-- CreateTable
CREATE TABLE "Vegetable" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" TEXT[],
    "sowing" TEXT NOT NULL,
    "harvest" TEXT NOT NULL,
    "affinity" TEXT[],
    "bad_neighbors" TEXT[],

    CONSTRAINT "Vegetable_pkey" PRIMARY KEY ("id")
);

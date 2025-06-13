/*
  Warnings:

  - You are about to drop the column `namme` on the `Vegetable` table. All the data in the column will be lost.
  - Added the required column `name` to the `Vegetable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vegetable" DROP COLUMN "namme",
ADD COLUMN     "name" TEXT NOT NULL;

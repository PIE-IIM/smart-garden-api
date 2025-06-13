/*
  Warnings:

  - Added the required column `namme` to the `Vegetable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vegetable" ADD COLUMN     "namme" TEXT NOT NULL;

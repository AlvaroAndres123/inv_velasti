/*
  Warnings:

  - Added the required column `valor` to the `Movimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "valor" DOUBLE PRECISION NOT NULL;

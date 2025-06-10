/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Movimiento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Movimiento" DROP CONSTRAINT "Movimiento_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Movimiento" DROP COLUMN "usuarioId";

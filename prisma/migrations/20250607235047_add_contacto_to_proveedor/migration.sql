/*
  Warnings:

  - Made the column `contacto` on table `Proveedor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Proveedor" ALTER COLUMN "contacto" SET NOT NULL;

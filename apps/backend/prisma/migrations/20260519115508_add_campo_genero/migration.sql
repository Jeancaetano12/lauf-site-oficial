/*
  Warnings:

  - Added the required column `genero` to the `SolicitacaoInscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMININO', 'NAO_BINARIO', 'OUTRO', 'PREFIRO_NAO_INFORMAR');

-- AlterTable
ALTER TABLE "SolicitacaoInscricao" ADD COLUMN     "genero" "Genero" NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "genero" "Genero" NOT NULL;

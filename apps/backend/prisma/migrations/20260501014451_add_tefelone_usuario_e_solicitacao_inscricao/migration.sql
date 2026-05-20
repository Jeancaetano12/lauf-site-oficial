/*
  Warnings:

  - A unique constraint covering the columns `[telefone]` on the table `SolicitacaoInscricao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefone]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telefone` to the `SolicitacaoInscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolicitacaoInscricao" ADD COLUMN     "telefone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoInscricao_telefone_key" ON "SolicitacaoInscricao"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");

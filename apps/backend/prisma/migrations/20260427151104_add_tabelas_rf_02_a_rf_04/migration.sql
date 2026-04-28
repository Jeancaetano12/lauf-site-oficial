/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `atualizadoEm` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curso` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Curso" AS ENUM ('ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS', 'BANCO_DE_DADOS', 'CIENCIAS_AERONAUTICAS', 'ENGENHARIA_DA_COMPUTACAO', 'GESTAO_DA_TECNOLOGIA_DA_INFORMACAO', 'JOGOS_DIGITAIS', 'SEGURANCA_DA_INFORMACAO');

-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ALUNO', 'PROFESSOR', 'MONITOR', 'COORDENADOR');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cargo" "Cargo" NOT NULL DEFAULT 'ALUNO',
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "curso" "Curso" NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Usuario_id_seq";

-- CreateTable
CREATE TABLE "SolicitacaoInscricao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "curso" "Curso" NOT NULL,
    "cargoPretendido" "Cargo" NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "tokenRegistro" TEXT,
    "tokenRegistroExpiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitacaoInscricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valido" BOOLEAN NOT NULL DEFAULT true,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoInscricao_email_key" ON "SolicitacaoInscricao"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoInscricao_matricula_key" ON "SolicitacaoInscricao"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoInscricao_tokenRegistro_key" ON "SolicitacaoInscricao"("tokenRegistro");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_refreshToken_key" ON "Sessao"("refreshToken");

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

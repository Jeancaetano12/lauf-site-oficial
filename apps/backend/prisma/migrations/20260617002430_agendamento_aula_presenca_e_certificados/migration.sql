-- CreateEnum
CREATE TYPE "StatusAula" AS ENUM ('AGENDADA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusEvento" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "status" "StatusAula" NOT NULL DEFAULT 'AGENDADA',
    "dataHora" TIMESTAMP(3) NOT NULL,
    "criadorId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "qrCodeToken" TEXT,
    "qrCodeExpiraEm" TIMESTAMP(3),
    "qrCodeAtivo" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresencaAula" (
    "id" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "confirmadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresencaAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificado" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "emitidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "status" "StatusEvento" NOT NULL DEFAULT 'AGENDADO',
    "dataHora" TIMESTAMP(3) NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "criadorId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "qrCodeToken" TEXT,
    "qrCodeExpiraEm" TIMESTAMP(3),
    "qrCodeAtivo" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteExterno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ParticipanteExterno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresencaEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "confirmadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresencaEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificadoEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "emitidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificadoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresencaAula_aulaId_usuarioId_key" ON "PresencaAula"("aulaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PresencaEvento_eventoId_participanteId_key" ON "PresencaEvento"("eventoId", "participanteId");

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaAula" ADD CONSTRAINT "PresencaAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaAula" ADD CONSTRAINT "PresencaAula_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaEvento" ADD CONSTRAINT "PresencaEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaEvento" ADD CONSTRAINT "PresencaEvento_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "ParticipanteExterno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoEvento" ADD CONSTRAINT "CertificadoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoEvento" ADD CONSTRAINT "CertificadoEvento_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "ParticipanteExterno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

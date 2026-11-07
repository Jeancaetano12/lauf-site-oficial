import { PrismaClient, Cargo, Curso, Genero, StatusAula } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateEntityId, ID_PREFIXES } from '@lauf/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados da LAUF...');

  const passwordHash = await bcrypt.hash('senha123', 10);

  // 1. Coordenador / Administrador
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@lauf.com' },
    update: {
      cargo: Cargo.COORDENADOR,
      senha: passwordHash,
    },
    create: {
      nome: 'Coordenador LAUF',
      email: 'admin@lauf.com',
      matricula: 'COORD001',
      telefone: '85999990001',
      cargo: Cargo.COORDENADOR,
      curso: Curso.ENGENHARIA_DA_COMPUTACAO,
      genero: Genero.PREFIRO_NAO_INFORMAR,
      senha: passwordHash,
    },
  });
  console.log(`👤 Coordenador garantido: ${admin.email}`);

  // 2. Professor
  const professor = await prisma.usuario.upsert({
    where: { email: 'professor@lauf.com' },
    update: {
      cargo: Cargo.PROFESSOR,
      senha: passwordHash,
    },
    create: {
      nome: 'Professor LAUF',
      email: 'professor@lauf.com',
      matricula: 'PROF001',
      telefone: '85999990002',
      cargo: Cargo.PROFESSOR,
      curso: Curso.ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS,
      genero: Genero.PREFIRO_NAO_INFORMAR,
      senha: passwordHash,
    },
  });
  console.log(`👤 Professor garantido: ${professor.email}`);

  // 3. Aluno
  const aluno = await prisma.usuario.upsert({
    where: { email: 'aluno@lauf.com' },
    update: {
      cargo: Cargo.ALUNO,
      senha: passwordHash,
    },
    create: {
      nome: 'Aluno LAUF',
      email: 'aluno@lauf.com',
      matricula: 'ALUNO001',
      telefone: '85999990003',
      cargo: Cargo.ALUNO,
      curso: Curso.ENGENHARIA_DA_COMPUTACAO,
      genero: Genero.PREFIRO_NAO_INFORMAR,
      senha: passwordHash,
    },
  });
  console.log(`👤 Aluno garantido: ${aluno.email}`);

  // 4. Aula modelo de demonstração
  const aulaExistente = await prisma.aula.findFirst({
    where: { titulo: 'Aula Inaugural: Introdução ao Portal LAUF' },
  });

  if (!aulaExistente) {
    const dataHoraFutura = new Date();
    dataHoraFutura.setDate(dataHoraFutura.getDate() + 7);
    dataHoraFutura.setHours(14, 0, 0, 0);

    const aulaId = generateEntityId(ID_PREFIXES.aula);

    const aula = await prisma.aula.create({
      data: {
        id: aulaId,
        titulo: 'Aula Inaugural: Introdução ao Portal LAUF',
        descricao: 'Aula prática de apresentação do portal e teste de presença.',
        local: 'Laboratório de Informática 01',
        status: StatusAula.AGENDADA,
        dataHora: dataHoraFutura,
        criadorId: admin.id,
        professorId: professor.id,
      },
    });
    console.log(`📚 Aula modelo criada: "${aula.titulo}" (ID: ${aula.id})`);
  } else {
    console.log(`📚 Aula modelo já existe: "${aulaExistente.titulo}"`);
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

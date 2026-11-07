import 'dotenv/config';
import { PrismaClient, Cargo, Curso, Genero, StatusAula } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Salvaguarda fatal de produção (D-03)
if (process.env.NODE_ENV === 'production') {
  console.error('🚨 ERRO FATAL: O script de seed não pode ser executado em ambiente de produção (NODE_ENV=production)!');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1') && !dbUrl.includes('postgres_db')) {
  console.error('🚨 ERRO FATAL: DATABASE_URL aparenta apontar para um banco externo/produção! Abortando seed.');
  process.exit(1);
}

// Detecção da flag --force (D-01)
const isForce = process.argv.includes('--force');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Constantes de entidades com IDs determinísticos (D-04)
const SEED_USERS = [
  {
    id: 'usr_seed_admin_001',
    email: 'admin@lauf.com',
    nome: 'Coordenador LAUF',
    matricula: 'COORD001',
    telefone: '85999990001',
    cargo: Cargo.COORDENADOR,
    curso: Curso.ENGENHARIA_DA_COMPUTACAO,
    genero: Genero.PREFIRO_NAO_INFORMAR,
  },
  {
    id: 'usr_seed_prof_001',
    email: 'professor@lauf.com',
    nome: 'Professor LAUF',
    matricula: 'PROF001',
    telefone: '85999990002',
    cargo: Cargo.PROFESSOR,
    curso: Curso.ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS,
    genero: Genero.PREFIRO_NAO_INFORMAR,
  },
  {
    id: 'usr_seed_alun_001',
    email: 'aluno@lauf.com',
    nome: 'Aluno LAUF',
    matricula: 'ALUNO001',
    telefone: '85999990003',
    cargo: Cargo.ALUNO,
    curso: Curso.ENGENHARIA_DA_COMPUTACAO,
    genero: Genero.PREFIRO_NAO_INFORMAR,
  },
];

const SEED_AULA = {
  id: 'aul_seed_demo_001',
  titulo: 'Aula Inaugural: Introdução ao Portal LAUF',
  local: 'Laboratório de Informática 01',
  descricao: 'Aula prática de apresentação do portal e teste de presença.',
  status: StatusAula.AGENDADA,
  criadorId: 'usr_seed_admin_001',
  professorId: 'usr_seed_prof_001',
};

async function main() {
  console.log(`🌱 Iniciando seed do banco de dados da LAUF... (Modo: ${isForce ? 'FORÇADO (--force)' : 'PADRÃO'})`);

  const passwordHash = await bcrypt.hash('senha123', 10);

  const dataHoraFutura = new Date();
  dataHoraFutura.setDate(dataHoraFutura.getDate() + 7);
  dataHoraFutura.setHours(14, 0, 0, 0);

  // Execução transacional atômica (D-05)
  await prisma.$transaction(async (tx) => {
    // 1. Usuários de Teste
    for (const user of SEED_USERS) {
      const usuarioExistente = await tx.usuario.findUnique({
        where: { email: user.email },
      });

      if (usuarioExistente) {
        if (isForce) {
          await tx.usuario.update({
            where: { email: user.email },
            data: {
              nome: user.nome,
              matricula: user.matricula,
              telefone: user.telefone,
              cargo: user.cargo,
              curso: user.curso,
              genero: user.genero,
              senha: passwordHash,
            },
          });
          console.log(`[RESETADO - FORÇADO] Usuário: ${user.email}`);
        } else {
          console.log(`[IGNORADO - JÁ EXISTE] Usuário: ${user.email}`);
        }
      } else {
        await tx.usuario.create({
          data: {
            id: user.id,
            email: user.email,
            nome: user.nome,
            matricula: user.matricula,
            telefone: user.telefone,
            cargo: user.cargo,
            curso: user.curso,
            genero: user.genero,
            senha: passwordHash,
          },
        });
        console.log(`[CRIADO] Usuário: ${user.email} (ID: ${user.id})`);
      }
    }

    // 2. Aula Modelo Inaugural (D-07)
    const aulaExistente = await tx.aula.findUnique({
      where: { id: SEED_AULA.id },
    });

    if (aulaExistente) {
      if (isForce) {
        await tx.aula.update({
          where: { id: SEED_AULA.id },
          data: {
            titulo: SEED_AULA.titulo,
            local: SEED_AULA.local,
            descricao: SEED_AULA.descricao,
            status: SEED_AULA.status,
            dataHora: dataHoraFutura,
            criadorId: SEED_AULA.criadorId,
            professorId: SEED_AULA.professorId,
          },
        });
        console.log(`[RESETADO - FORÇADO] Aula modelo: ${SEED_AULA.id}`);
      } else {
        console.log(`[IGNORADO - JÁ EXISTE] Aula modelo: ${SEED_AULA.id}`);
      }
    } else {
      await tx.aula.create({
        data: {
          id: SEED_AULA.id,
          titulo: SEED_AULA.titulo,
          local: SEED_AULA.local,
          descricao: SEED_AULA.descricao,
          status: SEED_AULA.status,
          dataHora: dataHoraFutura,
          criadorId: SEED_AULA.criadorId,
          professorId: SEED_AULA.professorId,
        },
      });
      console.log(`[CRIADO] Aula modelo: ${SEED_AULA.id}`);
    }
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

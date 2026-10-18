import { Cargo, Curso, Genero, StatusAula, StatusSolicitacao } from './enums';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProfessorResumo {
  id: string;
  nome: string;
}

export interface AulaDTO {
  id: string;
  titulo: string;
  local: string;
  descricao?: string | null;
  status: StatusAula;
  dataHora: string | Date;
  professor: ProfessorResumo;
}

export interface CriarAulaDTO {
  professorId: string;
  titulo: string;
  local: string;
  descricao?: string;
  status?: StatusAula;
  dataHora: string | Date;
}

export interface AtualizarAulaDTO {
  id?: string;
  titulo?: string;
  local?: string;
  descricao?: string;
  dataHora?: string | Date;
  status?: StatusAula;
  professorId?: string;
}

export interface SolicitarInscricaoDTO {
  nome: string;
  email: string;
  matricula: string;
  telefone: string;
  curso: Curso;
  cargoPretendido: Cargo;
  genero: Genero;
}

export interface SolicitacaoInscricaoDTO {
  id: string;
  nome: string;
  email?: string;
  matricula: string;
  telefone?: string;
  curso?: Curso;
  cargoPretendido: Cargo;
  genero?: Genero;
  status: StatusSolicitacao;
  criadoEm: string | Date;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  telefone: string;
  cargo: Cargo;
  curso: Curso;
  genero: Genero;
}

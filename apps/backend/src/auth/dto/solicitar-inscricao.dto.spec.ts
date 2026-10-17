import { validate } from 'class-validator';
import { SolicitarInscricaoDto } from './solicitar-inscricao.dto';
import { Cargo, Curso, Genero } from '@prisma/client';

describe('SolicitarInscricaoDto - Campo nome', () => {
  const createValidDto = (nome: string) => {
    const dto = new SolicitarInscricaoDto();
    dto.nome = nome;
    dto.email = 'usuario@teste.com';
    dto.matricula = '12345678';
    dto.telefone = '85989694059';
    dto.curso = Curso.ENGENHARIA_DA_COMPUTACAO;
    dto.cargoPretendido = Cargo.ALUNO;
    dto.genero = Genero.MASCULINO;
    return dto;
  };

  it('deve aceitar nome completo sem espaços extras', async () => {
    const dto = createValidDto('João Silva');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nome com espaços em branco no final', async () => {
    const dto = createValidDto('João Silva ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nome com múltiplos espaços no final', async () => {
    const dto = createValidDto('João Silva   ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nome com espaços no início e múltiplos espaços entre nomes', async () => {
    const dto = createValidDto('  João   Silva  ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nome simples (uma palavra)', async () => {
    const dto = createValidDto('João');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nome simples com espaço no final', async () => {
    const dto = createValidDto('João ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve aceitar nomes com acentos variados', async () => {
    const dto = createValidDto('Érica Ávila dos Santos ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeUndefined();
  });

  it('deve rejeitar sequências repetidas da mesma letra', async () => {
    const dto = createValidDto('aaaaaa');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeDefined();
  });

  it('deve rejeitar sequências repetidas da mesma letra com espaços no final', async () => {
    const dto = createValidDto('aaaaaa ');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeDefined();
  });

  it('deve rejeitar nomes contendo números', async () => {
    const dto = createValidDto('João Silva 123');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeDefined();
  });

  it('deve rejeitar nomes contendo caracteres especiais inválidos', async () => {
    const dto = createValidDto('João @ Silva');
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'nome')).toBeDefined();
  });
});

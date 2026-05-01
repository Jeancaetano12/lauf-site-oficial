import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Cargo, Curso } from '@prisma/client';

export class SolicitarInscricaoDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsString({ message: 'A matrícula deve ser uma string.' })
  @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
  matricula: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  telefone: string;

  @IsEnum(Curso, { message: 'Curso inválido.' })
  @IsNotEmpty({ message: 'O curso é obrigatório.' })
  curso: Curso;

  @IsEnum(Cargo, { message: 'Cargo inválido.' })
  @IsNotEmpty({ message: 'O cargo pretendido é obrigatório.' })
  cargoPretendido: Cargo;
}

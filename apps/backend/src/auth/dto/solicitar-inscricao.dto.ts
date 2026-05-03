import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
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
  @MinLength(8, { message: 'A matrícula deve ter pelo menos 8 caracteres.' })
  @MaxLength(9, { message: 'A matrícula deve ter no máximo 9 caracteres.' })
  @Matches(/^[0-9]+$/, { message: 'A matrícula deve conter apenas números.' })
  matricula: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @MinLength(11, { message: 'O telefone deve ter pelo menos 11 caracteres.' })
  @MaxLength(11, { message: 'O telefone deve ter no máximo 11 caracteres.' })
  @Matches(/^[0-9]+$/, { message: 'O telefone deve conter apenas números.' })
  telefone: string;

  @IsEnum(Curso, { message: 'Curso inválido.' })
  @IsNotEmpty({ message: 'O curso é obrigatório.' })
  curso: Curso;

  @IsEnum(Cargo, { message: 'Cargo inválido.' })
  @IsNotEmpty({ message: 'O cargo pretendido é obrigatório.' })
  cargoPretendido: Cargo;
}

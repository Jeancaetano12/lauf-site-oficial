import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { IsMatriculaValida } from '../decorators/matricula-valida.decorator';
import { Cargo, Curso, Genero } from '@prisma/client';

export class SolicitarInscricaoDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @Matches(/^(?!([A-Za-zÀ-ÿ])\1+$)[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)+$/, { message: 'O nome deve conter apenas letras e espaços, e não deve conter letras repetidas em sequência.' })
  nome: string;

  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsString({ message: 'A matrícula deve ser uma string.' })
  @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
  @MinLength(8, { message: 'A matrícula deve ter pelo menos 8 caracteres.' })
  @MaxLength(9, { message: 'A matrícula deve ter no máximo 9 caracteres.' })
  @IsMatriculaValida({ message: 'A matrícula possui um padrão inválido.' })
  matricula: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @MinLength(11, { message: 'O telefone deve ter pelo menos 11 caracteres.' })
  @MaxLength(11, { message: 'O telefone deve ter no máximo 11 caracteres.' })
  @Matches(/^(?!(\d)\1+$)([1-9]{2})(9\d{8})$/, { message: 'O telefone deve conter apenas números.' })
  telefone: string;

  @IsEnum(Curso, { message: 'Curso inválido.' })
  @IsNotEmpty({ message: 'O curso é obrigatório.' })
  curso: Curso;

  @IsEnum(Cargo, { message: 'Cargo inválido.' })
  @IsNotEmpty({ message: 'O cargo pretendido é obrigatório.' })
  cargoPretendido: Cargo;

  @IsEnum(Genero, { message: 'Genero inválido.' })
  @IsNotEmpty({ message: 'O gênero é obrigatório.' })
  genero: Genero;
}

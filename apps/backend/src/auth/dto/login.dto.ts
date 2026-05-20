import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'A matrícula deve ser uma string.' })
  @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
  @MinLength(8, { message: 'A matrícula deve ter pelo menos 8 caracteres.' })
  @MaxLength(9, { message: 'A matrícula deve ter no máximo 9 caracteres.' })
  @Matches(/^[0-9]+$/, { message: 'A matrícula deve conter apenas números.' })
  matricula: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  senha: string;
}

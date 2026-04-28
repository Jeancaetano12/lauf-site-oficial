import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ConcluirCadastroDto {
  @IsString({ message: 'O token deve ser uma string.' })
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  tokenRegistro: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'A matrícula deve ser uma string.' })
  @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
  matricula: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
}

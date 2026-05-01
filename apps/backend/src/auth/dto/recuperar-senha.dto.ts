import { IsNotEmpty, IsString } from 'class-validator';

export class RecuperarSenhaDto {
    @IsString({ message: 'O e-mail deve ser uma string.' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
    email: string;

    @IsString({ message: 'A matrícula deve ser uma string.' })
    @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
    matricula: string;
}

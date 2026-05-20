import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RecuperarSenhaDto {
    @IsEmail({}, { message: 'Forneça um e-mail válido.' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
    email: string;

    @IsString({ message: 'A matrícula deve ser uma string.' })
    @IsNotEmpty({ message: 'A matrícula é obrigatória.' })
    @MinLength(8, { message: 'A matrícula deve ter pelo menos 8 caracteres.' })
    @MaxLength(9, { message: 'A matrícula deve ter no máximo 9 caracteres.' })
    @Matches(/^[0-9]+$/, { message: 'A matrícula deve conter apenas números.' })
    matricula: string;
}

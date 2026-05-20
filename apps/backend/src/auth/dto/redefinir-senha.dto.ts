import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RedefinirSenhaDto {
    @IsString({ message: 'O tokenRecuperacaoSenha deve ser uma string.' })
    @IsNotEmpty({ message: 'O tokenRecuperacaoSenha é obrigatório.' })
    tokenRecuperacaoSenha: string;

    @IsString({ message: 'A senha deve ser uma string.' })
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    novaSenha: string;
}
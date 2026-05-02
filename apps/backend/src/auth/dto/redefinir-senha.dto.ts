import { IsNotEmpty, IsString } from "class-validator";

export class RedefinirSenhaDto {
    @IsString({ message: 'O tokenRecuperacaoSenha deve ser uma string.' })
    @IsNotEmpty({ message: 'O tokenRecuperacaoSenha é obrigatório.' })
    tokenRecuperacaoSenha: string;

    @IsString({ message: 'A senha deve ser uma string.' })
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    novaSenha: string;
}
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmarPresencaDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}

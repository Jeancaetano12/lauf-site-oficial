import { IsString, IsNotEmpty, IsUUID, IsEnum, IsDate, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusAula } from '@prisma/client';

export class CriarAulaDto {
    @IsUUID()
    professorId: string;

    @IsString()
    @IsNotEmpty({ message: 'O título é obrigatório.' })
    @MaxLength(50, { message: 'O título deve ter no máximo 50 caracteres.' })
    titulo: string;

    @IsString()
    @IsNotEmpty({ message: 'O local é obrigatório.' })
    @MaxLength(50, { message: 'O local deve ter no máximo 50 caracteres.' })
    local: string;

    @IsString()
    @MaxLength(140, { message: 'A descrição deve ter no máximo 140 caracteres.' })
    @IsOptional()
    descricao?: string;

    @IsEnum(StatusAula)
    @IsNotEmpty()
    status: StatusAula;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dataHora: Date;
}
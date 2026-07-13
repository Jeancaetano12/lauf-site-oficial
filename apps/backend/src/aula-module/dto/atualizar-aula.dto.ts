import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusAula } from '@prisma/client';

export class AtualizarAulaDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(50, { message: 'O título deve ter no máximo 50 caracteres.' })
    titulo?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(50, { message: 'O local deve ter no máximo 50 caracteres.' })
    local?: string;

    @IsString()
    @MaxLength(140)
    @IsOptional()
    descricao?: string;

    @IsEnum(StatusAula)
    @IsNotEmpty()
    @IsOptional()
    status?: StatusAula;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dataHora?: Date;

    @IsUUID()
    @IsOptional()
    professorId?: string;
}
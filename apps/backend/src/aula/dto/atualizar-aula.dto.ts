import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusAula } from '@prisma/client';

export class AtualizarAulaDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    titulo?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    local?: string;

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
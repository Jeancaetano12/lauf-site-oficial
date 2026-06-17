import { IsString, IsNotEmpty, IsUUID, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusAula } from '@prisma/client';

export class CriarAulaDto {
    @IsUUID()
    professorId: string;

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    local: string;

    @IsEnum(StatusAula)
    @IsNotEmpty()
    status: StatusAula;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dataHora: Date;
}
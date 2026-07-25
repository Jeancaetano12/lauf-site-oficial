import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusSolicitacao } from '@prisma/client';

export class GetSolicitacoesDto {
    @IsOptional()
    @IsEnum(StatusSolicitacao, { message: 'Status inválido. Deve ser PENDENTE, APROVADA ou REJEITADA.' })
    status?: StatusSolicitacao;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}

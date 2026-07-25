import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StatusSolicitacao } from "@prisma/client";

@Injectable()
export class SolicitacoesService {
    private readonly logger = new Logger(SolicitacoesService.name)
    constructor(private readonly prisma: PrismaService) { }

    async findAll(status?: StatusSolicitacao, page: number = 1, limit: number = 10) {
        try {
            const whereClause = status ? { status } : {};
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.prisma.solicitacaoInscricao.findMany({
                    where: whereClause,
                    orderBy: { criadoEm: 'desc' },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        nome: true,
                        matricula: true,
                        cargoPretendido: true,
                        status: true,
                        criadoEm: true,
                    }
                }),
                this.prisma.solicitacaoInscricao.count({ where: whereClause })
            ]);
            
            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                }
            };
        } catch (error) {
            this.logger.error(`[ERROR] Erro ao buscar todas as solicitações de inscrição com o status ${status}: ${error.message}`);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            return await this.prisma.solicitacaoInscricao.findUnique({
                where: { id },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    matricula: true,
                    telefone: true,
                    curso: true,
                    cargoPretendido: true,
                    genero: true,
                    status: true,
                    criadoEm: true,
                }
            })
        } catch (error) {
            this.logger.error(`[ERROR] Erro ao buscar solicitação de inscrição por ID ${id}: ${error.message}`);
            throw error;
        }
    }
}
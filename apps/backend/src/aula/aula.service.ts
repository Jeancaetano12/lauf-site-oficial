import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, Logger, InternalServerErrorException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';

@Injectable()
export class AulaService {
    private readonly logger = new Logger(AulaService.name)

    constructor(private readonly prisma: PrismaService) { }

    async criarAula(dto: CriarAulaDto, criadorId: string, auditoria: string) {
        try {
            // Regra: Não permitir sobreposição de horário (margem de 2 horas)
            // Consideramos sobreposição se for no mesmo local OU com o mesmo professor.
            const duasHorasAntes = new Date(dto.dataHora.getTime() - 2 * 60 * 60 * 1000);
            const duasHorasDepois = new Date(dto.dataHora.getTime() + 2 * 60 * 60 * 1000);

            const aulaSobreposta = await this.prisma.aula.findFirst({
                where: {
                    status: { not: 'CANCELADA' }, // Aulas canceladas não contam
                    dataHora: {
                        gte: duasHorasAntes,
                        lte: duasHorasDepois,
                    },
                    OR: [
                        { local: dto.local },
                        { professorId: dto.professorId }
                    ]
                }
            });

            if (aulaSobreposta) {
                throw new BadRequestException(
                    `Já existe uma aula agendada para este professor ou neste local num intervalo de 2 horas. Aula conflitante: ${aulaSobreposta.titulo}`
                );
            }

            const aula = await this.prisma.aula.create({
                data: {
                    ...dto,
                    criadorId, // Pegamos o ID de quem chamou a rota (do token)
                },
            });

            this.logger.log(`[AUDIT] Aula criada com ID ${aula.id} por ${auditoria}`);
            return aula;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.warn(`[WARN] Erro ao criar aula pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao criar aula");
        }
    }

    async listarAulas(auditoria: string) {

        try {
            const aulas = await this.prisma.aula.findMany({
                select: {
                    id: true,
                    titulo: true,
                    local: true,
                    status: true,
                    dataHora: true,
                    professor: { // Faz um "join" com a tabela de usuário para trazer os dados do professor
                        select: {
                            nome: true,
                        }
                    }
                }
            });

            if (aulas.length === 0) {
                throw new NotFoundException("Nenhuma aula encontrada");
            }

            this.logger.log(`[AUDIT] Aulas listadas para ${auditoria}`);
            return aulas;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.warn(`[WARN] Erro ao listar aulas pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao listar aulas");
        }
    }

    async detalheAula(id: string, auditoria: string) {
        try {
            const aula = await this.prisma.aula.findUnique({
                where: { id },
                select: {
                    id: true,
                    titulo: true,
                    local: true,
                    status: true,
                    dataHora: true,
                    professor: {
                        select: {
                            nome: true,
                        }
                    }
                }
            });

            if (!aula) {
                throw new NotFoundException("Aula não encontrada");
            }

            this.logger.log(`[AUDIT] Aula detalhada para ${auditoria}`);
            return aula;

        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.warn(`[WARN] Erro ao detalhar aula pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao detalhar aula");
        }
    }

    async atualizarAula(id: string, dto: AtualizarAulaDto, auditoria: string) {
        try {
            const aulaExistente = await this.prisma.aula.findUnique({
                where: { id }
            });

            if (!aulaExistente) {
                throw new NotFoundException("Aula não encontrada");
            }

            if (dto.professorId) {
                const professor = await this.prisma.usuario.findUnique({
                    where: { id: dto.professorId },
                });

                if (!professor) {
                    throw new NotFoundException("Professor não encontrado");
                }
            }

            // Aulas canceladas são IRREVERSIVEIS
            if (dto.status) {
                const verificarStatus = await this.prisma.aula.findFirst({
                    where: { id },
                    select: { status: true }
                })

                if (verificarStatus?.status === 'CANCELADA' || verificarStatus?.status === 'CONCLUIDA') {
                    throw new BadRequestException("Aula já foi cancelada ou concluída e não pode ser alterada");
                }
            }

            // Regra: Verificar sobreposição caso algum dado sensível seja alterado
            if (dto.dataHora || dto.local || dto.professorId) {
                const dataHoraCheck = dto.dataHora || aulaExistente.dataHora;
                const localCheck = dto.local || aulaExistente.local;
                const professorIdCheck = dto.professorId || aulaExistente.professorId;

                const duasHorasAntes = new Date(dataHoraCheck.getTime() - 2 * 60 * 60 * 1000);
                const duasHorasDepois = new Date(dataHoraCheck.getTime() + 2 * 60 * 60 * 1000);

                const aulaSobreposta = await this.prisma.aula.findFirst({
                    where: {
                        id: { not: id }, // não comparar com a própria aula
                        status: { not: 'CANCELADA' },
                        dataHora: {
                            gte: duasHorasAntes,
                            lte: duasHorasDepois,
                        },
                        OR: [
                            { local: localCheck },
                            { professorId: professorIdCheck }
                        ]
                    }
                });

                if (aulaSobreposta) {
                    throw new BadRequestException(
                        `A alteração causaria uma sobreposição de horário (margem de 2 horas) com a aula: ${aulaSobreposta.titulo}.`
                    );
                }
            }

            const aula = await this.prisma.aula.update({
                where: { id },
                data: dto,
            });

            this.logger.warn(`[WARN] Aula atualizada com ID ${aula.id} por ${auditoria}`);
            return aula;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[ERRO] Erro ao atualizar aula pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao atualizar aula");
        }
    }

    async listarProfessores(auditoria: string) {
        try {
            const professores = await this.prisma.usuario.findMany({
                where: {
                    OR: [
                        { cargo: 'PROFESSOR' },
                        { cargo: 'COORDENADOR' }
                    ]
                },
                select: {
                    id: true,
                    nome: true,
                },
                orderBy: {
                    nome: 'asc',
                }
            });

            if (professores.length === 0) {
                throw new NotFoundException("Nenhum professor encontrado");
            }

            this.logger.log(`[AUDIT] Professores listados para ${auditoria}`);
            return professores;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.warn(`[WARN] Erro ao listar professores pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao listar professores");
        }
    }
}

import { BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException, HttpException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';

@Injectable()
export class AulaService {
    private readonly logger = new Logger(AulaService.name)

    constructor(private readonly prisma: PrismaService) { }

    async criarAula(dto: CriarAulaDto, criadorId: string, auditoria: string) {
        try {
            // Regra: Não permitir agendamento no passado
            if (dto.dataHora < new Date()) {
                throw new BadRequestException('Não é possível agendar uma aula no passado.');
            }

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
                    professorId: dto.professorId,
                    titulo: dto.titulo.toUpperCase(),
                    local: dto.local.toUpperCase(),
                    descricao: dto.descricao,
                    status: dto.status,
                    dataHora: dto.dataHora,
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
                    descricao: true,
                    status: true,
                    dataHora: true,
                    professor: {
                        select: {
                            id: true,
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
            // Regra: Não permitir agendamento no passado
            if (dto.dataHora && dto.dataHora < new Date()) {
                throw new BadRequestException('Não é possível reagendar uma aula para o passado.');
            }

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
                    throw new BadRequestException("Aulas canceladas ou concluídas não podem ser alteradas");
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
                data: {
                    professorId: dto.professorId,
                    titulo: dto.titulo?.toUpperCase(),
                    local: dto.local?.toUpperCase(),
                    descricao: dto.descricao,
                    status: dto.status,
                    dataHora: dto.dataHora,
                },
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

    async iniciarChamada(id: string, user: any) {
        const auditoria = `${user.nome} (Id: ${user.id})`;
        try {
            const aulaExistente = await this.prisma.aula.findUnique({
                where: { id }
            });

            if (!aulaExistente) {
                throw new NotFoundException("Aula não encontrada");
            }

            if (aulaExistente.status !== 'AGENDADA') {
                throw new BadRequestException("Apenas aulas AGENDADAS podem ter chamada iniciada");
            }

            if (user.cargo === 'PROFESSOR' && aulaExistente.professorId !== user.id) {
                throw new ForbiddenException("Apenas o professor atribuído à aula pode iniciar a chamada.");
            }

            const qrCodeToken = randomUUID();
            const qrCodeExpiraEm = new Date(Date.now() + 15 * 60000); // 15 minutos

            const aula = await this.prisma.aula.update({
                where: { id },
                data: {
                    qrCodeToken,
                    qrCodeAtivo: true,
                    qrCodeExpiraEm
                }
            });

            // Timer simples para atualizar o status após os 15 minutos
            setTimeout(async () => {
                try {
                    const aulaAtual = await this.prisma.aula.findUnique({ where: { id } });
                    // Garante que ainda está agendada (se o professor já não alterou) e que o QR code ativo é o mesmo (ou se ainda está ativo)
                    if (aulaAtual && aulaAtual.status === 'AGENDADA' && aulaAtual.qrCodeAtivo) {
                        await this.prisma.aula.update({
                            where: { id },
                            data: {
                                qrCodeAtivo: false,
                                status: 'CONCLUIDA'
                            }
                        });
                        this.logger.warn(`[TIMEOUT] Aula ${id} expirou e foi marcada como CONCLUIDA.`);
                    }
                } catch (e) {
                    this.logger.error(`[TIMEOUT ERRO] Falha ao concluir aula ${id}: `, e);
                }
            }, 15 * 60000);

            this.logger.log(`[AUDIT] Chamada iniciada para a aula ${id} por ${auditoria}`);
            return aula;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[ERRO] Erro ao iniciar chamada pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao iniciar chamada");
        }
    }

    async encerrarChamada(id: string, user: any) {
        const auditoria = `${user.nome} (Id: ${user.id})`;
        try {
            const aulaExistente = await this.prisma.aula.findUnique({
                where: { id }
            });

            if (!aulaExistente) {
                throw new NotFoundException("Aula não encontrada");
            }

            if (user.cargo === 'PROFESSOR' && aulaExistente.professorId !== user.id) {
                throw new ForbiddenException("Apenas o professor atribuído à aula pode encerrar a chamada.");
            }

            const aula = await this.prisma.aula.update({
                where: { id },
                data: {
                    qrCodeAtivo: false,
                    status: 'CONCLUIDA'
                }
            });

            this.logger.log(`[AUDIT] Chamada encerrada para a aula ${id} por ${auditoria}`);
            return aula;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[ERRO] Erro ao encerrar chamada pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao encerrar chamada");
        }
    }

    async obterQrCode(id: string, user: any) {
        const auditoria = `${user.nome} (Id: ${user.id})`;
        try {
            const aula = await this.prisma.aula.findUnique({
                where: { id },
                select: {
                    id: true,
                    qrCodeToken: true,
                    qrCodeAtivo: true,
                    qrCodeExpiraEm: true,
                    professorId: true
                }
            });

            if (!aula) {
                throw new NotFoundException("Aula não encontrada");
            }

            if (user.cargo === 'PROFESSOR' && aula.professorId !== user.id) {
                throw new ForbiddenException("Você não tem permissão para visualizar o QR Code desta aula.");
            }

            if (!aula.qrCodeAtivo) {
                this.logger.warn(`[WARN] QR Code da aula ${id} expirou ou não foi gerado.`);
                return {
                    id: aula.id,
                    qrCodeAtivo: false,
                    qrCodeToken: null,
                    qrCodeExpiraEm: null,
                    professorId: true
                }
            }

            this.logger.log(`[AUDIT] QR Code da aula ${id} solicitado por ${auditoria}`);
            return aula;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[ERRO] Erro ao obter QR Code pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao obter QR Code");
        }
    }
}

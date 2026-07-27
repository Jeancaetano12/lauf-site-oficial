import { BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException, HttpException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';

@Injectable()
export class PresencaService {
    private readonly logger = new Logger(PresencaService.name)
    constructor(private readonly prisma: PrismaService) { }

    async confirmarPresencaAula(dto: ConfirmarPresencaDto, usuarioId: string, auditoria: string) {
        try {
            const aula = await this.prisma.aula.findFirst({
                where: { qrCodeToken: dto.token }
            });

            if (!aula) {
                throw new NotFoundException("QR Code inválido ou aula não encontrada");
            }

            if (!aula.qrCodeAtivo) {
                throw new BadRequestException("Chamada encerrada para esta aula");
            }

            if (!aula.qrCodeExpiraEm || aula.qrCodeExpiraEm < new Date()) {
                throw new BadRequestException("QR Code expirado");
            }

            // 5. Já existe PresencaAula com [aulaId, usuarioId]?
            const presencaExistente = await this.prisma.presencaAula.findUnique({
                where: {
                    aulaId_usuarioId: {
                        aulaId: aula.id,
                        usuarioId: usuarioId
                    }
                }
            });

            if (presencaExistente) {
                throw new ConflictException("Presença já confirmada");
            }

            const presenca = await this.prisma.presencaAula.create({
                data: {
                    aulaId: aula.id,
                    usuarioId: usuarioId
                }
            });

            this.logger.log(`[AUDIT] Presença confirmada para a aula ${aula.id} pelo usuário ${auditoria}`);
            return presenca;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`[ERRO] Erro ao confirmar presença pelo usuário ${auditoria}: `, error);
            throw new InternalServerErrorException("Erro ao confirmar presença");
        }
    }
}
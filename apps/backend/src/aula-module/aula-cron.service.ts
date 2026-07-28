import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AulaCronService {
  private readonly logger = new Logger(AulaCronService.name);

  constructor(private readonly prisma: PrismaService) { }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cancelarAulasVencidas() {
    this.logger.warn('[CronJob] Iniciando varredura de aulas vencidas (sem presença após 5h do horário marcado)');

    try {
      // 5 horas atrás
      const limite = new Date(Date.now() - 5 * 60 * 60 * 1000);

      const resultado = await this.prisma.aula.updateMany({
        where: {
          status: 'AGENDADA',
          dataHora: {
            lt: limite,
          },
          presencas: {
            none: {}, // Aulas que não possuem nenhuma presença registrada
          },
        },
        data: {
          status: 'CANCELADA',
        },
      });

      if (resultado.count > 0) {
        this.logger.warn(`[CronJob] Canceladas ${resultado.count} aula(s) vencidas e sem presença.`);
      } else {
        this.logger.warn('[CronJob] Nenhuma aula vencida precisava de cancelamento automático.');
      }
    } catch (error) {
      this.logger.error('[CronJob] Erro ao executar o cronjob de cancelamento de aulas.', error);
    }
  }
}

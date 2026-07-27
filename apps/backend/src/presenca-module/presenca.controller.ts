import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PresencaService } from './presenca.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';

@Controller('presenca')
export class PresencaController {
    private readonly logger = new Logger(PresencaController.name)

    constructor(private readonly presencaService: PresencaService) { }

    @Post('confirmar')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async confirmarPresencaAula(@Body() dto: ConfirmarPresencaDto, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Confirmar presença solicitada pelo usuário: ${user.nome}`);
        try {
            const auditoria = `${user.nome} (Id: ${user.id})`;
            return await this.presencaService.confirmarPresencaAula(dto, user.id, auditoria);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao confirmar presença pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }
}
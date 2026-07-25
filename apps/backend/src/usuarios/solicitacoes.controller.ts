import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger, UseGuards, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SolicitacoesService } from "./solicitacoes.service";
import { CargosGuard } from '../auth/guards/roles.guard';
import { Cargos } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetSolicitacoesDto } from './dto/get-solicitacoes.dto';

@Controller('usuarios/solicitacoes')
export class SolicitacoesController {
    private readonly logger = new Logger(SolicitacoesController.name)
    constructor(private readonly solicitacoesService: SolicitacoesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Throttle({ default: { limit: 60, ttl: 60000 } })
    @Cargos('COORDENADOR')
    async getAllSolicitacoes(@CurrentUser() user: any, @Query() query: GetSolicitacoesDto) {
        this.logger.log(`[AUDIT] Coordenador ${user.nome} buscou solicitações de inscrição. Filtro: ${query.status || 'Nenhum'}, Pagina: ${query.page || 1}`);
        return this.solicitacoesService.findAll(query.status, query.page, query.limit);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Throttle({ default: { limit: 60, ttl: 60000 } })
    @Cargos('COORDENADOR')
    async getSolicitacaoById(@CurrentUser() user: any, @Param('id') id: string) {
        this.logger.log(`[AUDIT] Coordenador ${user.nome} buscou solicitação de inscrição ${id}`);
        return this.solicitacoesService.findById(id);
    }
}
import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger, UseGuards, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AulaService } from './aula.service';
import { CargosGuard } from '../auth/guards/roles.guard';
import { Cargos } from '../auth/decorators/roles.decorator';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';

@Controller('aulas')
export class AulaController {
    private readonly logger = new Logger(AulaController.name)

    constructor(private readonly aulaService: AulaService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Cargos('COORDENADOR', 'PROFESSOR')
    async criarAula(@Body() dto: CriarAulaDto, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Criação de aula recebida pelo usuário: ${user.nome} com os seguintes dados: ${JSON.stringify(dto)}`);
        try {
            const criadorId = user.id;
            const auditoria = `${user.nome} (Id: ${user.id})`;
            return await this.aulaService.criarAula(dto, criadorId, auditoria);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao criar aula pelo usuário ${user.nome} (Id: ${user.id}): `, error);
            throw error;
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    async listarAulas(@CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Listagem de aulas solicitada pelo usuário: ${user.nome}`);
        try {
            const auditoria = `${user.nome} (Matricula: ${user.matricula})`;
            return await this.aulaService.listarAulas(auditoria);
        } catch (error) {
            this.logger.warn(`[WARN] Erro ao listar aulas pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Get('professores')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @UseGuards(JwtAuthGuard)
    async listarProfessores(@CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Listagem de professores solicitada pelo usuário: ${user.nome}`);
        try {
            const auditoria = `${user.nome} (Matricula: ${user.matricula})`;
            return await this.aulaService.listarProfessores(auditoria);
        } catch (error) {
            this.logger.warn(`[WARN] Erro ao listar professores pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @UseGuards(JwtAuthGuard)
    async detalheAula(@Param('id') id: string, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Detalhe de aula solicitado pelo usuário: ${user.nome} para a aula ${id}`);
        try {
            const auditoria = `${user.nome} (Id: ${user.matricula})`;
            return await this.aulaService.detalheAula(id, auditoria);
        } catch (error) {
            this.logger.warn(`[WARN] Erro ao detalhar aula pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Cargos('COORDENADOR', 'PROFESSOR')
    async atualizarAula(@Param('id') id: string, @Body() dto: AtualizarAulaDto, @CurrentUser() user: any) {
        this.logger.warn(`[WARN] Atualização de aula solicitada pelo usuário: ${user.nome} para a aula ${id} com os seguintes dados: ${JSON.stringify(dto)}`);
        try {
            const auditoria = `${user.nome} (Id: ${user.id})`;
            return await this.aulaService.atualizarAula(id, dto, auditoria);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao atualizar aula pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Patch(':id/iniciar-chamada')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Cargos('COORDENADOR', 'PROFESSOR')
    async iniciarChamada(@Param('id') id: string, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Início de chamada solicitado pelo usuário: ${user.nome} para a aula ${id}`);
        try {
            return await this.aulaService.iniciarChamada(id, user);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao iniciar chamada pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Patch(':id/encerrar-chamada')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Cargos('COORDENADOR', 'PROFESSOR')
    async encerrarChamada(@Param('id') id: string, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Encerramento de chamada solicitado pelo usuário: ${user.nome} para a aula ${id}`);
        try {
            return await this.aulaService.encerrarChamada(id, user);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao encerrar chamada pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Get(':id/qr')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Cargos('COORDENADOR', 'PROFESSOR')
    async obterQrCode(@Param('id') id: string, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Obtenção de QR Code solicitada pelo usuário: ${user.nome} para a aula ${id}`);
        try {
            return await this.aulaService.obterQrCode(id, user);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao obter QR Code pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }

    @Get(':id/presenca')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, CargosGuard)
    @Cargos('COORDENADOR', 'PROFESSOR')
    async obterListaDePresenca(@Param('id') id: string, @CurrentUser() user: any) {
        this.logger.log(`[AUDIT] Obtenção de lista de presença solicitada pelo usuário: ${user.nome} para a aula ${id}`);
        try {
            return await this.aulaService.obterListaDePresenca(id, user);
        } catch (error) {
            this.logger.error(`[ERRO] Erro ao obter lista de presença pelo usuário ${user.nome}: `, error);
            throw error;
        }
    }
}

import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CargosGuard } from './guards/roles.guard';
import { Cargos } from './decorators/roles.decorator';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('solicitar-inscricao')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async solicitarInscricao(@Body() dto: SolicitarInscricaoDto) {
    this.logger.log(`[DEBUG] Solicitação de inscrição recebida com os seguintes dados: ${dto.matricula}, ${dto.email}`);
    return this.authService.solicitarInscricao(dto);
  }

  @Patch('solicitacoes/:id/aprovar')
  @UseGuards(JwtAuthGuard, CargosGuard)
  @Cargos('COORDENADOR')
  async aprovarSolicitacao(@Param('id') id: string, @CurrentUser() user: any) {
    const auditoria = `${user.nome} (${user.email} - ${user.matricula})`;
    this.logger.log(`[AUDIT] Aprovação de solicitação recebida para o ID: ${id} pelo usuário: ${auditoria}`);
    return this.authService.aprovarSolicitacao(id, auditoria);
  }

  @Patch('solicitacoes/:id/rejeitar')
  @UseGuards(JwtAuthGuard, CargosGuard)
  @Cargos('COORDENADOR')
  async rejeitarSolicitacao(@Param('id') id: string, @CurrentUser() user: any) {
    const auditoria = `${user.nome} (${user.email} - ${user.matricula})`;
    this.logger.log(`[AUDIT] Rejeição de solicitação recebida para o ID: ${id} pelo usuário: ${auditoria}`);
    return this.authService.rejeitarSolicitacao(id, auditoria);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`[DEBUG] Login recebido com os seguintes dados: ${dto.matricula}`);
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    this.logger.log('[DEBUG] Solicitação de refresh token recebida');
    return this.authService.refreshToken(refreshToken);
  }

  @Post('concluir-cadastro')
  @HttpCode(HttpStatus.OK)
  async concluirCadastro(@Body() dto: ConcluirCadastroDto) {
    this.logger.log(`[DEBUG] Conclusão de cadastro recebida para o tokenRegistro: ${dto.tokenRegistro}`);
    return this.authService.concluirCadastro(dto);
  }

  @Post('solicitar-recuperacao-senha')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async solicitarRecuperacaoSenha(@Body() dto: RecuperarSenhaDto) {
    this.logger.log(`[DEBUG] Solicitação de recuperação de senha recebida com os seguintes dados: ${dto.email}, ${dto.matricula}`);
    return this.authService.solicitarRecuperacaoSenha(dto);
  }

  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    this.logger.log(`[DEBUG] Redefinição de senha recebida com os seguintes dados: ${dto.tokenRecuperacaoSenha}`);
    return this.authService.redefinirSenha(dto.tokenRecuperacaoSenha, dto.novaSenha);
  }

  @Post('logoff')
  @HttpCode(HttpStatus.OK)
  async logoff(@Body('usuarioId') usuarioId: string) {
    this.logger.log(`[DEBUG] Logoff recebido com os seguintes dados: ${usuarioId}`);
    return this.authService.logOff(usuarioId);
  }

  @Post('validate-sessao')
  @HttpCode(HttpStatus.OK)
  async validarSessao(@Body('refreshToken') refreshToken: string) {
    this.logger.log(`[DEBUG] Requisição de validação de sessão recebida`);
    return this.authService.validarSessao(refreshToken);
  }
}
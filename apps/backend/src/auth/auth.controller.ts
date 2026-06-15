import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger, UseGuards, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`[DEBUG] Login recebido com os seguintes dados: ${dto.matricula}`);
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { message: 'Login realizado com sucesso', usuario: result.usuario };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.logger.log('[DEBUG] Solicitação de refresh token recebida');
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não fornecido.');
    }
    const result = await this.authService.refreshToken(refreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { message: 'Tokens atualizados com sucesso', usuario: result.usuario };
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    this.logger.log(`[DEBUG] Logout recebido para uma sessao: ${refreshToken}`);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    if (refreshToken) {
      return this.authService.logOut(refreshToken);
    }
    return { message: 'Logout realizado localmente' };
  }

  @Post('validar-sessao')
  @HttpCode(HttpStatus.OK)
  async validarSessao(@Req() req: Request) {
    this.logger.log(`[DEBUG] Requisição de validação de sessão recebida`);
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Nenhum refresh token fornecido.');
    }
    return this.authService.validarSessao(refreshToken);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });
  }
}
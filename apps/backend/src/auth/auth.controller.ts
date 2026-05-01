import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { CargosGuard } from './guards/roles.guard';
import { Cargos } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('solicitar-inscricao')
  async solicitarInscricao(@Body() dto: SolicitarInscricaoDto) {
    this.logger.log('[DEBUG] Solicitação de inscrição recebida com os seguintes dados: ', dto.matricula, dto.email);
    return this.authService.solicitarInscricao(dto);
  }

  @Patch('solicitacoes/:id/aprovar')
  @UseGuards(CargosGuard)
  @Cargos('COORDENADOR')
  async aprovarSolicitacao(@Param('id') id: string) {
    this.logger.log('[DEBUG] Aprovação de solicitação recebida para o ID: ', id);
    return this.authService.aprovarSolicitacao(id);
  }

  @Patch('solicitacoes/:id/rejeitar')
  @UseGuards(CargosGuard)
  @Cargos('COORDENADOR')
  async rejeitarSolicitacao(@Param('id') id: string) {
    this.logger.log('[DEBUG] Rejeição de solicitação recebida para o ID: ', id);
    return this.authService.rejeitarSolicitacao(id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    this.logger.log('[DEBUG] Login recebido com os seguintes dados: ', dto.matricula);
    return this.authService.login(dto);
  }

  @Post('concluir-cadastro')
  @HttpCode(HttpStatus.OK)
  async concluirCadastro(@Body() dto: ConcluirCadastroDto) {
    this.logger.log('[DEBUG] Conclusão de cadastro recebida com os seguintes dados: ', dto.tokenRegistro);
    return this.authService.concluirCadastro(dto);
  }

  @Post('solicitar-recuperacao-senha')
  @HttpCode(HttpStatus.OK)
  async solicitarRecuperacaoSenha(@Body() dto: RecuperarSenhaDto) {
    this.logger.log('[DEBUG] Solicitação de recuperação de senha recebida com os seguintes dados: ', dto.email, dto.matricula);
    return this.authService.solicitarRecuperacaoSenha(dto.email, dto.matricula);
  }

  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  async redefinirSenha(@Body() dto: any) {
    this.logger.log('[DEBUG] Redefinição de senha recebida com os seguintes dados: ', dto.token);
    return this.authService.redefinirSenha(dto.token, dto.novaSenha);
  }
}
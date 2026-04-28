import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('solicitar-inscricao')
  async solicitarInscricao(@Body() dto: SolicitarInscricaoDto) {
    this.logger.log('Solicitação de inscrição recebida com os seguintes dados: ', dto.matricula, dto.email);
    return this.authService.solicitarInscricao(dto);
  }

  @Patch('solicitacoes/:id/aprovar')
  async aprovarSolicitacao(@Param('id') id: string) {
    this.logger.log(`Aprovação de solicitação recebida para o ID: ${id}`);
    return this.authService.aprovarSolicitacao(id);
  }

  @Patch('solicitacoes/:id/rejeitar')
  async rejeitarSolicitacao(@Param('id') id: string) {
    this.logger.log(`Rejeição de solicitação recebida para o ID: ${id}`);
    return this.authService.rejeitarSolicitacao(id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    this.logger.log('Login recebido com os seguintes dados: ', dto.matricula);
    return this.authService.login(dto);
  }

  @Post('concluir-cadastro')
  @HttpCode(HttpStatus.OK)
  async concluirCadastro(@Body() dto: ConcluirCadastroDto) {
    this.logger.log('Conclusão de cadastro recebida com os seguintes dados: ', dto.tokenRegistro);
    return this.authService.concluirCadastro(dto);
  }
}
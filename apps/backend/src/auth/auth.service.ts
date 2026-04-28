import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async solicitarInscricao(dto: SolicitarInscricaoDto) {
    const existingSolicitacao = await this.prisma.solicitacaoInscricao.findFirst({
      where: {
        OR: [{ email: dto.email }, { matricula: dto.matricula }],
      },
      select: { status: true }
    });

    if (existingSolicitacao && existingSolicitacao.status === 'PENDENTE') {
      throw new BadRequestException('Já existe uma solicitação com este e-mail ou matrícula.');
    }

    if (existingSolicitacao && existingSolicitacao.status === 'APROVADA') {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { matricula: dto.matricula }
      })

      if (existingUser) {
        throw new BadRequestException('Já existe um usuário cadastrado com esta matrícula.');
      } else {
        throw new BadRequestException('Já existe uma solicitação aprovada com esta matrícula.');
      }
    }

    if (existingSolicitacao && existingSolicitacao.status === 'REJEITADA') {
      const solicitacao2 = await this.prisma.solicitacaoInscricao.create({
        data: {
          nome: dto.nome,
          email: dto.email,
          matricula: dto.matricula,
          curso: dto.curso,
          cargoPretendido: dto.cargoPretendido,
        },
      });

      // TODO: Disparar envio de e-mail usando o MailModule futuramente

      this.logger.log(`Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} solicitou inscrição novamente`)
      return { message: 'Solicitação enviada novamente.', id: solicitacao2.id };
    }

    const solicitacao = await this.prisma.solicitacaoInscricao.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        matricula: dto.matricula,
        curso: dto.curso,
        cargoPretendido: dto.cargoPretendido,
      },
    });

    // TODO: Disparar envio de e-mail usando o MailModule futuramente

    this.logger.log(`Solicitação de inscrição criada com sucesso. ID: ${solicitacao.id}`);
    return { message: 'Solicitação criada com sucesso.', id: solicitacao.id };
  }

  async aprovarSolicitacao(id: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    if (solicitacao.status !== 'PENDENTE') {
      throw new BadRequestException('Esta solicitação já foi processada.');
    }

    const tokenRegistro = randomBytes(32).toString('hex');
    const tokenRegistroExpiraEm = new Date();
    tokenRegistroExpiraEm.setDate(tokenRegistroExpiraEm.getDate() + 7); // 7 dias de validade

    await this.prisma.solicitacaoInscricao.update({
      where: { id },
      data: {
        status: 'APROVADA',
        tokenRegistro,
        tokenRegistroExpiraEm,
      },
    });

    // TODO: Disparar envio de e-mail usando o MailModule futuramente

    return {
      message: 'Solicitação aprovada.',
      tokenGerado: tokenRegistro, // Retornando apenas para facilitar testes
    };
  }

  async rejeitarSolicitacao(id: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.')
    }

    if (solicitacao.status === 'APROVADA') {
      throw new BadRequestException('Esta solicitação já foi aprovada.');
    }

    if (solicitacao.status === 'PENDENTE') {
      const rejeitar = await this.prisma.solicitacaoInscricao.update({
        where: { id },
        data: {
          status: 'REJEITADA'
        },
      });

      return {
        message: 'Solicitação rejeitada', id: rejeitar.id
      };
    }
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { matricula: dto.matricula },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senha);
    if (!senhaCorreta) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.gerarTokensESessao(usuario.id, usuario.matricula, usuario.cargo, usuario.email);
  }

  async concluirCadastro(dto: ConcluirCadastroDto) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { tokenRegistro: dto.tokenRegistro },
    });

    if (!solicitacao) {
      throw new NotFoundException('Token de registro inválido ou não encontrado.');
    }

    if (solicitacao.tokenRegistroExpiraEm && solicitacao.tokenRegistroExpiraEm < new Date()) {
      throw new BadRequestException('O token de registro expirou.');
    }

    const hashSenha = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: solicitacao.nome,
        email: solicitacao.email,
        matricula: solicitacao.matricula,
        curso: solicitacao.curso,
        cargo: solicitacao.cargoPretendido,
        senha: hashSenha,
      },
    });

    // Limpar o token da solicitação para não ser reusado
    await this.prisma.solicitacaoInscricao.update({
      where: { id: solicitacao.id },
      data: { tokenRegistro: null, tokenRegistroExpiraEm: null },
    });

    // Remover senha do objeto retornado
    const { senha, ...userWithoutPassword } = usuario;
    return {
      message: 'Cadastro concluído com sucesso.',
      usuario: userWithoutPassword,
    };
  }

  private async gerarTokensESessao(usuarioId: string, matricula: string, cargo: string, email: string) {
    const payload = { sub: usuarioId, matricula, cargo, email };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = randomBytes(40).toString('hex');
    const expiresInDays = 7;
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + expiresInDays);

    await this.prisma.sessao.create({
      data: {
        usuarioId,
        refreshToken,
        expiraEm: dataExpiracao,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { SolicitarInscricaoDto } from './dto/solicitar-inscricao.dto';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { LoginDto } from './dto/login.dto';
import { ConcluirCadastroDto } from './dto/concluir-cadastro.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async solicitarInscricao(dto: SolicitarInscricaoDto) {
    const solicitacaoExistente = await this.prisma.solicitacaoInscricao.findFirst({
      where: {
        OR: [{ email: dto.email }, { matricula: dto.matricula }],
      },
      select: {
        id: true,
        status: true,
        tokenRegistroExpiraEm: true,
        email: true,
        nome: true,
      },
    });

    if (solicitacaoExistente && solicitacaoExistente.status === 'PENDENTE') {
      this.logger.log(
        `[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} barrado pois já existe uma solicitação pendente`,
      );
      throw new BadRequestException('Já existe uma solicitação com este e-mail ou matrícula.');
    }

    if (solicitacaoExistente && solicitacaoExistente.status === 'APROVADA') {
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { matricula: dto.matricula },
      });

      if (usuarioExistente) {
        this.logger.log(
          `[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} foi barrado porque já é usuário`,
        );
        throw new BadRequestException('Já existe um usuário cadastrado com esta matrícula.');
      }

      // Se a solicitação está aprovada mas o token expirou, renovamos e reenviamos o e-mail
      if (solicitacaoExistente.tokenRegistroExpiraEm && solicitacaoExistente.tokenRegistroExpiraEm < new Date()) {
        const tokenRegistro = randomBytes(32).toString('hex');
        const tokenRegistroExpiraEm = new Date();
        tokenRegistroExpiraEm.setDate(tokenRegistroExpiraEm.getDate() + 7); // +7 dias

        await this.prisma.solicitacaoInscricao.update({
          where: { id: solicitacaoExistente.id },
          data: {
            tokenRegistro,
            tokenRegistroExpiraEm,
          },
        });

        this.logger.log(`[DEBUG] Renovando token de inscrição expirado para email: ${solicitacaoExistente.email}`);
        const emailAprovacao = await this.mailService.enviarEmailAprovacao(
          solicitacaoExistente.email,
          solicitacaoExistente.nome,
          tokenRegistro,
        );

        if (emailAprovacao === 0) {
          await this.prisma.solicitacaoInscricao.update({
            where: { id: solicitacaoExistente.id },
            data: {
              tokenRegistro: null,
              tokenRegistroExpiraEm: null,
            },
          });
          this.logger.error(`Erro ao reenviar e-mail de aprovação para ${solicitacaoExistente.email}`);
          throw new InternalServerErrorException(
            'Não foi possível reenviar o e-mail de aprovação. Tente novamente mais tarde.',
          );
        }

        return {
          message:
            'Sua solicitação já havia sido aprovada, mas o token expirou. Um novo link de cadastro foi enviado para o seu e-mail.',
        };
      }

      this.logger.log(
        `[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} foi barrado porque já está aprovado`,
      );
      throw new BadRequestException(
        'Já existe uma solicitação aprovada com esta matrícula. Verifique seu e-mail para concluir o cadastro.',
      );
    }

    if (solicitacaoExistente && solicitacaoExistente.status === 'REJEITADA') {
      const solicitacao2 = await this.prisma.solicitacaoInscricao.create({
        data: {
          nome: dto.nome.toUpperCase(),
          email: dto.email.toLowerCase(),
          matricula: dto.matricula,
          telefone: dto.telefone.trim(),
          curso: dto.curso,
          cargoPretendido: dto.cargoPretendido,
          genero: dto.genero,
        },
      });

      this.logger.log(`[DEBUG] Solicitacao de inscricao criada com sucesso. email: ${dto.email}, Disparando email...`);
      const emailConfirmacaoSolicitacao2 = await this.mailService.enviarEmailConfirmacaoSolicitacao(solicitacao2.email, solicitacao2.nome)

      if (emailConfirmacaoSolicitacao2 === 0) {
        await this.prisma.solicitacaoInscricao.delete({
          where: { id: solicitacao2.id }
        })
        this.logger.error(`Solicitacao de inscricao excluida devido a falha no envio do email. email: ${dto.email}`);
        throw new InternalServerErrorException('Não foi possível enviar o e-mail de confirmação de solicitação. Tente novamente mais tarde.');
      }

      this.logger.log(`[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} solicitou inscrição novamente`)
      return { message: 'Solicitação enviada novamente.', id: solicitacao2.id };
    }

    const solicitacao = await this.prisma.solicitacaoInscricao.create({
      data: {
        nome: dto.nome.toUpperCase(),
        email: dto.email.toLowerCase(),
        matricula: dto.matricula,
        telefone: dto.telefone.trim(),
        curso: dto.curso,
        cargoPretendido: dto.cargoPretendido,
        genero: dto.genero,
      },
    });

    this.logger.log(`[DEBUG] Solicitacao de inscricao criada com sucesso. email: ${dto.email}, Disparando email...`);
    const emailConfirmacaoSolicitacao = await this.mailService.enviarEmailConfirmacaoSolicitacao(solicitacao.email, solicitacao.nome)

    if (emailConfirmacaoSolicitacao === 0) {
      await this.prisma.solicitacaoInscricao.delete({
        where: { id: solicitacao.id }
      })
      this.logger.error(`Solicitacao de inscricao excluida devido a falha no envio do email. email: ${dto.email}`);
      throw new InternalServerErrorException('Não foi possível enviar o e-mail de confirmação de solicitação. Tente novamente mais tarde.');
    }

    this.logger.log(`[DEBUG] Solicitacao de inscricao criada com sucesso. ID: ${solicitacao.id}`);
    return { message: 'Solicitação criada com sucesso.', id: solicitacao.id };
  }

  async aprovarSolicitacao(id: string, processadoPor?: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
    });

    if (!solicitacao) {
      this.logger.log(`[DEBUG] Solicitacao de inscricao com o id ${id} nao foi encontrada para aprovacao`);
      throw new NotFoundException('Solicitação não encontrada.');
    }

    if (solicitacao.status !== 'PENDENTE') {
      this.logger.log(`[DEBUG] Solicitacao de inscricao com o id ${id} ja foi processada`);
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
        processadoPor,
      },
    });

    this.logger.log(`[DEBUG] Solicitacao de inscricao aprovada com sucesso. email: ${solicitacao.email}, Disparando email...`);
    const emailAprovacao = await this.mailService.enviarEmailAprovacao(solicitacao.email, solicitacao.nome, tokenRegistro)

    if (emailAprovacao === 0) {
      await this.prisma.solicitacaoInscricao.update({
        where: { id },
        data: {
          tokenRegistro: null,
          tokenRegistroExpiraEm: null,
        },
      });
      this.logger.error(`Token de inscricao removido devido a falha no envio do email. email: ${solicitacao.email}`);
      throw new InternalServerErrorException('Não foi possível enviar o e-mail de aprovação. Tente novamente mais tarde.');
    }

    return {
      message: 'Solicitação aprovada.', tokenGerado: tokenRegistro
    };
  }

  async rejeitarSolicitacao(id: string, processadoPor?: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
      select: { status: true, email: true, nome: true }
    });

    if (!solicitacao) {
      this.logger.log(`[DEBUG] Solicitacao de inscricao com o id ${id} nao foi encontrada para rejeicao`);
      throw new NotFoundException('Solicitação não encontrada.')
    }

    if (solicitacao.status === 'APROVADA') {
      this.logger.log(`[DEBUG] Solicitacao de inscricao com o id ${id} ja foi aprovada`);
      throw new BadRequestException('Esta solicitação já foi aprovada.');
    }

    if (solicitacao.status === 'PENDENTE') {
      const rejeitar = await this.prisma.solicitacaoInscricao.update({
        where: { id },
        data: {
          status: 'REJEITADA',
          processadoPor,
        },
      });

      this.logger.log(`[DEBUG] Solicitacao de inscricao rejeitada para o email: ${solicitacao.email}, id: ${id}, Disparando email...`);
      const emailRejeicao = await this.mailService.enviarEmailRejeicao(solicitacao.email, solicitacao.nome)

      if (emailRejeicao === 0) {
        this.logger.error(`Falha no envio do email de rejeicao. email: ${solicitacao.email}`);
        throw new InternalServerErrorException('Não foi possível enviar o e-mail de rejeição. Tente novamente mais tarde.');
      }

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
      this.logger.log(`[DEBUG] Usuario com a matricula ${dto.matricula} nao foi encontrado para login`);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senha);
    if (!senhaCorreta) {
      this.logger.log(`[DEBUG] Usuario com a matricula ${dto.matricula} inseriu senha incorreta`);
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    this.logger.log(`[DEBUG] Usuario com a matricula ${dto.matricula} logou com sucesso, Disparando email...`);
    const emailLogin = await this.mailService.enviarEmailLogin(usuario.email, usuario.nome);
    if (emailLogin === 0) {
      this.logger.warn(`Falha no envio do email de login. email: ${usuario.email}`);
      // throw new InternalServerErrorException('Não foi possível enviar o e-mail de login. Tente novamente mais tarde.');
    }
    this.logger.log(`[DEBUG] Usuario com a matricula ${dto.matricula} logou com sucesso, Sessão iniciada...`);
    return this.gerarTokensESessao(usuario.id, usuario.matricula, usuario.cargo, usuario.email, usuario.nome, usuario.telefone);
  }

  async refreshToken(refreshToken: string) {
    const sessao = await this.prisma.sessao.findFirst({
      where: { refreshToken, valido: true },
      include: { usuario: true },
    });

    if (!sessao) {
      this.logger.log(`[DEBUG] Tentativa de uso de Refresh Token inválido ou revogado: ${refreshToken}`);
      throw new UnauthorizedException('Refresh token inválido ou sessão revogada.');
    }

    if (sessao.expiraEm < new Date()) {
      this.logger.log(`[DEBUG] Tentativa de uso de Refresh Token expirado: ${refreshToken}`);
      await this.prisma.sessao.update({
        where: { id: sessao.id },
        data: { valido: false },
      });
      throw new UnauthorizedException('Refresh token expirado. Faça login novamente.');
    }

    // Rotaciona o token e invalida a sessão anterior para segurança
    await this.prisma.sessao.delete({ where: { id: sessao.id } });

    const { usuario } = sessao;
    this.logger.log(`[DEBUG] Refresh Token validado. Gerando novos tokens para o usuario ID: ${usuario.id}`);
    return this.gerarTokensESessao(usuario.id, usuario.matricula, usuario.cargo, usuario.email, usuario.nome, usuario.telefone);
  }

  async concluirCadastro(dto: ConcluirCadastroDto) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { tokenRegistro: dto.tokenRegistro },
    });

    if (!solicitacao) {
      this.logger.log(`[DEBUG] Usuario com o token de registro ${dto.tokenRegistro} nao foi encontrado para concluir cadastro`);
      throw new NotFoundException('Token de registro inválido ou não encontrado.');
    }

    if (solicitacao.tokenRegistroExpiraEm && solicitacao.tokenRegistroExpiraEm < new Date()) {
      this.logger.log(`[DEBUG] Usuario com o token de registro ${dto.tokenRegistro} inseriu token de registro expirado`);
      throw new BadRequestException('O token de registro expirou.');
    }

    const hashSenha = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: solicitacao.nome.toUpperCase(),
        email: solicitacao.email.toLowerCase(),
        matricula: solicitacao.matricula,
        telefone: solicitacao.telefone.trim(),
        curso: solicitacao.curso,
        cargo: solicitacao.cargoPretendido,
        senha: hashSenha,
        genero: solicitacao.genero,
      },
    });

    // Limpar o token da solicitação para não ser reusado
    await this.prisma.solicitacaoInscricao.update({
      where: { id: solicitacao.id },
      data: { tokenRegistro: null, tokenRegistroExpiraEm: null },
    });

    // Remover senha do objeto retornado
    const { senha, ...userWithoutPassword } = usuario;
    this.logger.log(`[DEBUG] Usuario com a matricula ${usuario.matricula} concluiu cadastro com sucesso`);
    return {
      message: 'Cadastro concluído com sucesso.',
      usuario: userWithoutPassword,
    };
  }

  async solicitarRecuperacaoSenha(dto: RecuperarSenhaDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email, matricula: dto.matricula },
    });

    if (!usuario) {
      this.logger.log(`[DEBUG] Usuario com o email ${dto.email} e matricula ${dto.matricula} nao foi encontrado para recuperar senha`);
      // Retornamos mensagem de sucesso para não revelar se o email existe ou não (segurança)
      return { message: 'Se o e-mail existir, um link de recuperação foi enviado.' };
    }

    const tokenRecuperacaoSenha = randomBytes(32).toString('hex');
    const tokenRecuperacaoExpiraEm = new Date();
    tokenRecuperacaoExpiraEm.setHours(tokenRecuperacaoExpiraEm.getHours() + 1); // Expira em 1 hora

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacaoSenha,
        tokenRecuperacaoExpiraEm,
      },
    });

    this.logger.log(`[DEBUG] Solicitacao de recuperacao de senha gerada para o email: ${dto.email}, Disparando email...`);
    const emailRecuperacaoSenha = await this.mailService.enviarEmailRecuperacaoSenha(usuario.email, tokenRecuperacaoSenha);

    if (emailRecuperacaoSenha === 0) {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tokenRecuperacaoSenha: null,
          tokenRecuperacaoExpiraEm: null,
        },
      });
      this.logger.error(`Token de recuperacao de senha removido devido a falha no envio do email. email: ${usuario.email}`);
      throw new InternalServerErrorException('Não foi possível enviar o e-mail de recuperação de senha. Tente novamente mais tarde.');
    }

    this.logger.log(`[DEBUG] Solicitacao de recuperacao de senha gerada para o email: ${dto.email}`);
    return { message: 'Se o e-mail existir, um link de recuperação foi enviado.', tokenGerado: tokenRecuperacaoSenha };
  }

  async logOff(usuarioId: string) {
    this.logger.log(`[DEBUG] Realizando LogOff do usuario com o ID: ${usuarioId}`);
    const sessoes = await this.prisma.sessao.deleteMany({
      where: { usuarioId: usuarioId },
    });
    if (sessoes.count === 0) {
      this.logger.log(`[DEBUG] Usuario com o ID ${usuarioId} nao tem sessoes ativas`);
      return { message: 'Usuario nao tem sessoes ativas' };
    }
    this.logger.log(`[DEBUG] LogOff realizado com sucesso para o usuario com o ID: ${usuarioId}`);
    return { message: 'LogOff realizado com sucesso' };
  }

  async redefinirSenha(tokenRecuperacaoSenha: string, novaSenha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { tokenRecuperacaoSenha },
    });

    if (!usuario) {
      this.logger.log(`[DEBUG] Tentativa falha de redefinir senha. Token invalido.`);
      throw new NotFoundException('Token inválido ou expirado.');
    }

    if (!usuario.tokenRecuperacaoExpiraEm || usuario.tokenRecuperacaoExpiraEm < new Date()) {
      this.logger.log(`[DEBUG] Tentativa falha de redefinir senha. Token expirado.`);
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tokenRecuperacaoSenha: null,
          tokenRecuperacaoExpiraEm: null,
        },
      });
      throw new BadRequestException('O token de recuperação expirou.');
    }

    const hashSenha = await bcrypt.hash(novaSenha, 10);

    // Segurança: Deslogar o usuário de todos os aparelhos
    await this.logOff(usuario.id);

    // Atualiza a senha e inutiliza o token
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: hashSenha,
        tokenRecuperacaoSenha: null,
        tokenRecuperacaoExpiraEm: null,
      },
    });

    this.logger.log(`[DEBUG] Senha redefinida e sessoes revogadas com sucesso para o ID: ${usuario.id}`);

    const emailRecuperacaoSenhaSucesso = await this.mailService.enviarEmailRecuperacaoSenhaSucesso(usuario.email, usuario.nome);
    if (emailRecuperacaoSenhaSucesso === 0) {
      this.logger.error(`Falha no envio do email de recuperacao de senha. email: ${usuario.email}`);
      // throw new InternalServerErrorException('Não foi possível enviar o e-mail de recuperação de senha. Tente novamente mais tarde.');
    }

    return { message: 'Senha redefinida com sucesso. Faça login novamente.' };
  }

  private async gerarTokensESessao(usuarioId: string, matricula: string, cargo: string, email: string, nome: string, telefone: string) {
    const payload = { sub: usuarioId, matricula, cargo, email, nome, telefone };

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
    this.logger.log(`[DEBUG] Tokens gerados com sucesso para o usuario com matricula: ${matricula}, email: ${email}, cargo: ${cargo}`)
    return {
      accessToken,
      refreshToken,
    };
  }
}
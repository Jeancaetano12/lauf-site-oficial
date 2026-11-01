import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { generateEntityId, ID_PREFIXES } from '@lauf/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { StatusSolicitacao } from '@prisma/client';
import { randomBytes } from 'crypto';
import { SolicitarInscricaoDto } from '../auth/dto/solicitar-inscricao.dto';

@Injectable()
export class SolicitacoesService {
  private readonly logger = new Logger(SolicitacoesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll(
    status?: StatusSolicitacao,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const whereClause = status ? { status } : {};
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.solicitacaoInscricao.findMany({
          where: whereClause,
          orderBy: { criadoEm: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            nome: true,
            matricula: true,
            cargoPretendido: true,
            status: true,
            criadoEm: true,
          },
        }),
        this.prisma.solicitacaoInscricao.count({ where: whereClause }),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `[ERROR] Erro ao buscar todas as solicitações de inscrição com o status ${status}: ${error.message}`,
      );
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.solicitacaoInscricao.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          matricula: true,
          telefone: true,
          curso: true,
          cargoPretendido: true,
          genero: true,
          status: true,
          criadoEm: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `[ERROR] Erro ao buscar solicitação de inscrição por ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async solicitarInscricao(dto: SolicitarInscricaoDto) {
    const solicitacaoExistente =
      await this.prisma.solicitacaoInscricao.findFirst({
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
      throw new BadRequestException(
        'Já existe uma solicitação com este e-mail ou matrícula.',
      );
    }

    if (solicitacaoExistente && solicitacaoExistente.status === 'APROVADA') {
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { matricula: dto.matricula },
      });

      if (usuarioExistente) {
        this.logger.log(
          `[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} foi barrado porque já é usuário`,
        );
        throw new BadRequestException(
          'Já existe um usuário cadastrado com esta matrícula.',
        );
      }

      // Se a solicitação está aprovada mas o token expirou, renovamos e reenviamos o e-mail
      if (
        solicitacaoExistente.tokenRegistroExpiraEm &&
        solicitacaoExistente.tokenRegistroExpiraEm < new Date()
      ) {
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

        this.logger.log(
          `[DEBUG] Renovando token de inscrição expirado para email: ${solicitacaoExistente.email}`,
        );
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
          this.logger.error(
            `Erro ao reenviar e-mail de aprovação para ${solicitacaoExistente.email}`,
          );
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
          id: generateEntityId(ID_PREFIXES.solicitacao),
          nome: dto.nome.trim().toUpperCase(),
          email: dto.email.toLowerCase(),
          matricula: dto.matricula,
          telefone: dto.telefone.trim(),
          curso: dto.curso,
          cargoPretendido: dto.cargoPretendido,
          genero: dto.genero,
        },
      });

      this.logger.log(
        `[DEBUG] Solicitacao de inscricao criada com sucesso. email: ${dto.email}, Disparando email...`,
      );
      const emailConfirmacaoSolicitacao2 =
        await this.mailService.enviarEmailConfirmacaoSolicitacao(
          solicitacao2.email,
          solicitacao2.nome,
        );

      if (emailConfirmacaoSolicitacao2 === 0) {
        await this.prisma.solicitacaoInscricao.delete({
          where: { id: solicitacao2.id },
        });
        this.logger.error(
          `Solicitacao de inscricao excluida devido a falha no envio do email. email: ${dto.email}`,
        );
        throw new InternalServerErrorException(
          'Não foi possível enviar o e-mail de confirmação de solicitação. Tente novamente mais tarde.',
        );
      }

      this.logger.log(
        `[DEBUG] Usuario: ${dto.nome}, email: ${dto.email}, matricula: ${dto.matricula} solicitou inscrição novamente`,
      );
      return { message: 'Solicitação enviada novamente.', id: solicitacao2.id };
    }

    const solicitacao = await this.prisma.solicitacaoInscricao.create({
      data: {
        id: generateEntityId(ID_PREFIXES.solicitacao),
        nome: dto.nome.trim().toUpperCase(),
        email: dto.email.toLowerCase(),
        matricula: dto.matricula,
        telefone: dto.telefone.trim(),
        curso: dto.curso,
        cargoPretendido: dto.cargoPretendido,
        genero: dto.genero,
      },
    });

    this.logger.log(
      `[DEBUG] Solicitacao de inscricao criada com sucesso. email: ${dto.email}, Disparando email...`,
    );
    const emailConfirmacaoSolicitacao =
      await this.mailService.enviarEmailConfirmacaoSolicitacao(
        solicitacao.email,
        solicitacao.nome,
      );

    if (emailConfirmacaoSolicitacao === 0) {
      await this.prisma.solicitacaoInscricao.delete({
        where: { id: solicitacao.id },
      });
      this.logger.error(
        `Solicitacao de inscricao excluida devido a falha no envio do email. email: ${dto.email}`,
      );
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail de confirmação de solicitação. Tente novamente mais tarde.',
      );
    }

    this.logger.log(
      `[DEBUG] Solicitacao de inscricao criada com sucesso. ID: ${solicitacao.id}`,
    );
    return { message: 'Solicitação criada com sucesso.', id: solicitacao.id };
  }

  async aprovarSolicitacao(id: string, processadoPor?: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
    });

    if (!solicitacao) {
      this.logger.log(
        `[DEBUG] Solicitacao de inscricao com o id ${id} nao foi encontrada para aprovacao`,
      );
      throw new NotFoundException('Solicitação não encontrada.');
    }

    if (solicitacao.status !== 'PENDENTE') {
      this.logger.log(
        `[DEBUG] Solicitacao de inscricao com o id ${id} ja foi processada`,
      );
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

    this.logger.log(
      `[DEBUG] Solicitacao de inscricao aprovada com sucesso. email: ${solicitacao.email}, Disparando email...`,
    );
    const emailAprovacao = await this.mailService.enviarEmailAprovacao(
      solicitacao.email,
      solicitacao.nome,
      tokenRegistro,
    );

    if (emailAprovacao === 0) {
      await this.prisma.solicitacaoInscricao.update({
        where: { id },
        data: {
          tokenRegistro: null,
          tokenRegistroExpiraEm: null,
        },
      });
      this.logger.error(
        `Token de inscricao removido devido a falha no envio do email. email: ${solicitacao.email}`,
      );
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail de aprovação. Tente novamente mais tarde.',
      );
    }

    return {
      message: 'Solicitação aprovada.',
    };
  }

  async rejeitarSolicitacao(id: string, processadoPor?: string) {
    const solicitacao = await this.prisma.solicitacaoInscricao.findUnique({
      where: { id },
      select: { status: true, email: true, nome: true },
    });

    if (!solicitacao) {
      this.logger.log(
        `[DEBUG] Solicitacao de inscricao com o id ${id} nao foi encontrada para rejeicao`,
      );
      throw new NotFoundException('Solicitação não encontrada.');
    }

    if (solicitacao.status !== 'PENDENTE') {
      this.logger.log(
        `[DEBUG] Solicitacao de inscricao com o id ${id} ja foi processada`,
      );
      throw new BadRequestException('Esta solicitação já foi processada.');
    }

    const rejeitar = await this.prisma.solicitacaoInscricao.update({
      where: { id },
      data: {
        status: 'REJEITADA',
        processadoPor,
      },
    });

    this.logger.log(
      `[DEBUG] Solicitacao de inscricao rejeitada para o email: ${solicitacao.email}, id: ${id}, Disparando email...`,
    );
    const emailRejeicao = await this.mailService.enviarEmailRejeicao(
      solicitacao.email,
      solicitacao.nome,
    );

    if (emailRejeicao === 0) {
      this.logger.error(
        `Falha no envio do email de rejeicao. email: ${solicitacao.email}`,
      );
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail de rejeição. Tente novamente mais tarde.',
      );
    }

    return {
      message: 'Solicitação rejeitada',
      id: rejeitar.id,
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacoesService } from './solicitacoes.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Curso } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { SolicitarInscricaoDto } from '../auth/dto/solicitar-inscricao.dto';

// Criamos um Mock (imitação) do Prisma para não tocar no banco real
const mockPrismaService = {
  solicitacaoInscricao: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
  },
};

// Criamos um Mock do MailService
const mockMailService = {
  enviarEmailConfirmacaoSolicitacao: jest.fn().mockResolvedValue({}),
  enviarEmailAprovacao: jest.fn().mockResolvedValue({}),
  enviarEmailRejeicao: jest.fn().mockResolvedValue({}),
};

describe('SolicitacoesService', () => {
  let service: SolicitacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitacoesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<SolicitacoesService>(SolicitacoesService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa o estado entre cada teste
  });

  describe('findAll', () => {
    it('deve retornar dados paginados com meta', async () => {
      mockPrismaService.solicitacaoInscricao.findMany.mockResolvedValue([
        { id: '1' },
      ]);
      mockPrismaService.solicitacaoInscricao.count.mockResolvedValue(11);

      const resultado = await service.findAll(undefined, 2, 10);

      expect(
        mockPrismaService.solicitacaoInscricao.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: {}, skip: 10, take: 10 }),
      );
      expect(resultado).toEqual({
        data: [{ id: '1' }],
        meta: { total: 11, page: 2, limit: 10, totalPages: 2 },
      });
    });

    it('deve filtrar por status', async () => {
      mockPrismaService.solicitacaoInscricao.findMany.mockResolvedValue([]);
      mockPrismaService.solicitacaoInscricao.count.mockResolvedValue(0);

      const resultado = await service.findAll('PENDENTE');

      expect(
        mockPrismaService.solicitacaoInscricao.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDENTE' } }),
      );
      expect(resultado.data).toEqual([]);
    });

    it('deve repropagar erros do banco', async () => {
      mockPrismaService.solicitacaoInscricao.findMany.mockRejectedValue(
        new Error('db'),
      );
      await expect(service.findAll()).rejects.toThrow('db');
    });
  });

  describe('findById', () => {
    it('deve retornar a solicitacao pelo ID', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'sol_1234567890abcdef',
      });
      await expect(service.findById('sol_1234567890abcdef')).resolves.toEqual({ id: 'sol_1234567890abcdef' });
    });

    it('deve repropagar erros do banco', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockRejectedValue(
        new Error('db'),
      );
      await expect(service.findById('sol_1234567890abcdef')).rejects.toThrow('db');
    });
  });

  describe('solicitarInscricao', () => {
    it('deve criar uma nova solicitacao se nao existir nenhuma pendente ou aprovada', async () => {
      // Configuração: Simular que findFirst retornou vazio (não existe)
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue(null);
      // Simular retorno da criação
      mockPrismaService.solicitacaoInscricao.create.mockImplementation(
        async ({ data }) => ({
          id: data.id,
          ...data,
        }),
      );

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      const resultado = await service.solicitarInscricao(dto);

      expect(
        mockPrismaService.solicitacaoInscricao.findFirst,
      ).toHaveBeenCalled();
      expect(mockPrismaService.solicitacaoInscricao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: expect.stringMatching(/^sol_[0-9a-z]{16}$/),
          }),
        }),
      );
      expect(
        mockMailService.enviarEmailConfirmacaoSolicitacao,
      ).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação criada com sucesso.');
      expect(resultado.id).toMatch(/^sol_[0-9a-z]{16}$/);
    });

    it('deve rejeitar se o usuario ja estiver cadastrado', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        status: 'APROVADA',
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'id-usuario',
      });

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve reenviar o email caso a solicitacao ja esteja aprovada e o token tenha expirado', async () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        id: 'id-solicitacao',
        status: 'APROVADA',
        email: 'joao@teste.com',
        nome: 'João',
        tokenRegistroExpiraEm: dataPassada,
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockMailService.enviarEmailAprovacao.mockResolvedValue(1);

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      const resultado = await service.solicitarInscricao(dto);

      expect(mockPrismaService.solicitacaoInscricao.update).toHaveBeenCalled();
      expect(mockMailService.enviarEmailAprovacao).toHaveBeenCalledWith(
        'joao@teste.com',
        'João',
        expect.any(String),
      );

      expect(resultado.message).toBe(
        'Sua solicitação já havia sido aprovada, mas o token expirou. Um novo link de cadastro foi enviado para o seu e-mail.',
      );
    });

    it('deve apagar o token de registro e rejeitar caso ocorra erro ao reenviar o email de aprovação', async () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        id: 'id-solicitacao',
        status: 'APROVADA',
        email: 'joao@teste.com',
        nome: 'João',
        tokenRegistroExpiraEm: dataPassada,
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      // Simula a falha no envio do email (retorna 0) apenas uma vez para não afetar os outros testes
      mockMailService.enviarEmailAprovacao.mockResolvedValueOnce(0);

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(
        InternalServerErrorException,
      );

      // Verifica se o último update foi para limpar os dados do token
      expect(
        mockPrismaService.solicitacaoInscricao.update,
      ).toHaveBeenLastCalledWith({
        where: { id: 'id-solicitacao' },
        data: {
          tokenRegistro: null,
          tokenRegistroExpiraEm: null,
        },
      });
    });

    it('deve rejeitar se ja existir uma solicitacao PENDENTE', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        status: 'PENDENTE',
      });

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve rejeitar se ja existir uma solicitacao APROVADA', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        status: 'APROVADA',
      });

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      await expect(service.solicitarInscricao(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve criar uma nova solicitacao se ja existir uma solicitacao REJEITADA', async () => {
      mockPrismaService.solicitacaoInscricao.findFirst.mockResolvedValue({
        status: 'REJEITADA',
      });
      mockPrismaService.solicitacaoInscricao.create.mockImplementation(
        async ({ data }) => ({
          id: data.id,
          ...data,
        }),
      );

      const dto: SolicitarInscricaoDto = {
        nome: 'João',
        email: 'joao@teste.com',
        matricula: '01548379',
        telefone: '85989694059',
        curso: Curso.ENGENHARIA_DA_COMPUTACAO,
        cargoPretendido: 'ALUNO',
        genero: 'MASCULINO',
      };

      const resultado = await service.solicitarInscricao(dto);

      expect(mockPrismaService.solicitacaoInscricao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: expect.stringMatching(/^sol_[0-9a-z]{16}$/),
          }),
        }),
      );
      expect(
        mockMailService.enviarEmailConfirmacaoSolicitacao,
      ).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação enviada novamente.');
      expect(resultado.id).toMatch(/^sol_[0-9a-z]{16}$/);
    });
  });

  describe('aprovarSolicitacao', () => {
    it('deve aprovar a solicitacao e gerar o tokenRegistro', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'sol_1234567890abcdef',
        status: 'PENDENTE',
      });
      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({
        status: 'APROVADA',
      });

      const resultado = await service.aprovarSolicitacao('sol_1234567890abcdef');

      expect(mockPrismaService.solicitacaoInscricao.update).toHaveBeenCalled();
      expect(mockMailService.enviarEmailAprovacao).toHaveBeenCalled();
      expect(resultado.message).toBe('Solicitação aprovada.');
      expect(resultado).not.toHaveProperty('tokenGerado'); // Token nunca deve vazar na resposta HTTP
    });

    it('deve rejeitar se ocorrer erro ao enviar o email de aprovacao, revertendo a aprovacao', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'sol_1234567890abcdef',
        status: 'PENDENTE',
      });
      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({
        status: 'APROVADA',
      });
      mockMailService.enviarEmailAprovacao.mockResolvedValue(0);
      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({
        id: 'sol_1234567890abcdef',
        data: { tokenRegistro: null, tokenRegistroExpiraEm: null },
      });

      await expect(service.aprovarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve rejeitar se a solicitacao nao existir', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue(null);

      await expect(service.aprovarSolicitacao('id-nao-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve rejeitar se a solicitacao ja estiver aprovada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'sol_1234567890abcdef',
        status: 'APROVADA',
      });

      await expect(service.aprovarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve rejeitar se a solicitacao ja estiver rejeitada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        id: 'sol_1234567890abcdef',
        status: 'REJEITADA',
      });

      await expect(service.aprovarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejeitarSolicitacao', () => {
    it('deve rejeitar uma solicitacao pendente com sucesso', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        status: 'PENDENTE',
        email: 'joao@teste.com',
        nome: 'João',
      });

      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({
        id: 'sol_1234567890abcdef',
      });

      mockMailService.enviarEmailRejeicao.mockResolvedValue(1);

      const resultado = await service.rejeitarSolicitacao('sol_1234567890abcdef');

      expect(
        mockPrismaService.solicitacaoInscricao.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 'sol_1234567890abcdef' },
        select: {
          status: true,
          email: true,
          nome: true,
        },
      });

      expect(
        mockPrismaService.solicitacaoInscricao.update,
      ).toHaveBeenCalledWith({
        where: { id: 'sol_1234567890abcdef' },
        data: {
          status: 'REJEITADA',
          processadoPor: undefined,
        },
      });

      expect(mockMailService.enviarEmailRejeicao).toHaveBeenCalledWith(
        'joao@teste.com',
        'João',
      );

      expect(resultado).toEqual({
        message: 'Solicitação rejeitada',
        id: 'sol_1234567890abcdef',
      });
    });

    it('deve lançar erro se a solicitacao nao existir', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue(null);

      await expect(
        service.rejeitarSolicitacao('id-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se a solicitacao ja estiver aprovada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        status: 'APROVADA',
        email: 'joao@teste.com',
        nome: 'João',
      });

      await expect(service.rejeitarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar erro se a solicitacao ja estiver rejeitada', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        status: 'REJEITADA',
        email: 'joao@teste.com',
        nome: 'João',
      });

      await expect(service.rejeitarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar erro caso ocorra falha no envio do email de rejeicao', async () => {
      mockPrismaService.solicitacaoInscricao.findUnique.mockResolvedValue({
        status: 'PENDENTE',
        email: 'joao@teste.com',
        nome: 'João',
      });

      mockPrismaService.solicitacaoInscricao.update.mockResolvedValue({
        id: 'sol_1234567890abcdef',
      });

      mockMailService.enviarEmailRejeicao.mockResolvedValueOnce(0);

      await expect(service.rejeitarSolicitacao('sol_1234567890abcdef')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockMailService.enviarEmailRejeicao).toHaveBeenCalledWith(
        'joao@teste.com',
        'João',
      );
    });
  });
});

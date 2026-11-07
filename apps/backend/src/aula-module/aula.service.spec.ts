import { Test, TestingModule } from '@nestjs/testing';
import { AulaService } from './aula.service';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { StatusAula } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('AulaService', () => {
  let service: AulaService;
  let prisma: PrismaService;

  const mockPrismaService = {
    aula: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    presencaAula: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AulaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AulaService>(AulaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criarAula', () => {
    const dto: CriarAulaDto = {
      professorId: 'uuid-prof',
      titulo: 'Aula Teste',
      local: 'Sala 1',
      status: StatusAula.AGENDADA,
      dataHora: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
    const criadorId = 'uuid-criador';
    const auditoria = 'Teste User';

    it('deve criar uma aula com sucesso', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue(null);
      mockPrismaService.aula.create.mockImplementation(async ({ data }) => ({
        id: data.id,
        ...dto,
      }));

      const result = await service.criarAula(dto, criadorId, auditoria);
      expect(result).toBeDefined();
      expect(result.id).toMatch(/^aula_[0-9a-z]{16}$/);
      expect(mockPrismaService.aula.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: expect.stringMatching(/^aula_[0-9a-z]{16}$/),
          titulo: dto.titulo.toUpperCase(),
          criadorId,
        }),
      });
    });

    it('deve lançar erro se dataHora for no passado', async () => {
      const pastDto = {
        ...dto,
        dataHora: new Date(new Date().getTime() - 10000),
      };
      await expect(
        service.criarAula(pastDto, criadorId, auditoria),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se houver sobreposição de aula', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue({
        id: 'aula-conflitante',
        titulo: 'Conflito',
      });
      await expect(
        service.criarAula(dto, criadorId, auditoria),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarAulas', () => {
    it('deve listar aulas com sucesso', async () => {
      mockPrismaService.aula.findMany.mockResolvedValue([
        { id: 'aula_1234567890abcdef', titulo: 'Aula Teste' },
      ]);
      const result = await service.listarAulas('Teste User');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve retornar array vazio (200 OK) se não houver aulas', async () => {
      mockPrismaService.aula.findMany.mockResolvedValue([]);
      await expect(service.listarAulas('Teste User')).resolves.toEqual([]);
    });
  });

  describe('detalheAula', () => {
    it('deve detalhar uma aula com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        titulo: 'Aula Teste',
      });
      const result = await service.detalheAula(
        'aula_1234567890abcdef',
        'Teste User',
      );
      expect(result).toBeDefined();
    });

    it('deve lançar erro se aula não for encontrada', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(
        service.detalheAula('invalid-id', 'Teste User'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizarAula', () => {
    const dto: AtualizarAulaDto = { titulo: 'Aula Atualizada' };

    it('deve atualizar uma aula com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        status: StatusAula.AGENDADA,
      });
      mockPrismaService.aula.findFirst.mockResolvedValue(null);
      mockPrismaService.aula.update.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        ...dto,
      });

      const result = await service.atualizarAula(
        'aula_1234567890abcdef',
        dto,
        'Teste User',
      );
      expect(result).toBeDefined();
    });

    it('deve lançar erro se tentar reagendar para o passado', async () => {
      const pastDto = { dataHora: new Date(new Date().getTime() - 10000) };
      await expect(
        service.atualizarAula('aula_1234567890abcdef', pastDto, 'Teste User'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se aula não existir', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(
        service.atualizarAula('invalid-id', dto, 'Teste User'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se professor não for encontrado', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(
        service.atualizarAula(
          'aula_1234567890abcdef',
          { professorId: 'invalid-prof' },
          'Teste',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se aula já estiver cancelada ou concluída e tentar mudar status', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
      });
      mockPrismaService.aula.findFirst.mockResolvedValue({
        status: 'CANCELADA',
      });
      await expect(
        service.atualizarAula(
          'aula_1234567890abcdef',
          { status: StatusAula.AGENDADA },
          'Teste',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se alteração causar sobreposição', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        dataHora: new Date(),
      });
      mockPrismaService.aula.findFirst.mockResolvedValue({ id: 'conflito' });
      await expect(
        service.atualizarAula(
          'aula_1234567890abcdef',
          { local: 'Sala 2' },
          'Teste',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarProfessores', () => {
    it('deve listar professores com sucesso', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([
        { id: 'uuid-prof', nome: 'Professor Teste' },
      ]);
      const result = await service.listarProfessores('Teste User');
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve retornar array vazio (200 OK) se nenhum professor for encontrado', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([]);
      await expect(service.listarProfessores('Teste User')).resolves.toEqual(
        [],
      );
    });
  });

  describe('iniciarChamada', () => {
    const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };

    it('deve iniciar chamada com sucesso', async () => {
      jest.useFakeTimers();
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        status: StatusAula.AGENDADA,
        professorId: 'uuid-prof',
      });
      mockPrismaService.aula.update.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        qrCodeAtivo: true,
      });

      const result = await service.iniciarChamada(
        'aula_1234567890abcdef',
        user,
      );
      expect(result).toBeDefined();
      // Expiração é responsabilidade do AulaCronService, sem timers em memória
      expect(jest.getTimerCount()).toBe(0);

      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('deve lançar erro se aula não existir', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(service.iniciarChamada('invalid-id', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar erro se aula não estiver AGENDADA', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        status: StatusAula.CONCLUIDA,
      });
      await expect(
        service.iniciarChamada('aula_1234567890abcdef', user),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se o usuário for PROFESSOR e não for o dono da aula', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        status: StatusAula.AGENDADA,
        professorId: 'outro-prof',
      });
      await expect(
        service.iniciarChamada('aula_1234567890abcdef', user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('encerrarChamada', () => {
    const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };

    it('deve encerrar chamada com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        professorId: 'uuid-prof',
      });
      mockPrismaService.aula.update.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        qrCodeAtivo: false,
        status: StatusAula.CONCLUIDA,
      });

      const result = await service.encerrarChamada(
        'aula_1234567890abcdef',
        user,
      );
      expect(result).toBeDefined();
    });

    it('deve lançar erro se aula não existir', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(service.encerrarChamada('invalid-id', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar erro se o usuário for PROFESSOR e não for o dono da aula', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        professorId: 'outro-prof',
      });
      await expect(
        service.encerrarChamada('aula_1234567890abcdef', user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('obterQrCode', () => {
    const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };

    it('deve obter QR code com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        qrCodeToken: 'token',
        qrCodeAtivo: true,
        professorId: 'uuid-prof',
      });
      const result = await service.obterQrCode('aula_1234567890abcdef', user);
      expect(result).toBeDefined();
    });

    it('deve concluir a aula imediatamente se o QR Code já expirou (lazy expiration)', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        qrCodeToken: 'token',
        qrCodeAtivo: true,
        qrCodeExpiraEm: new Date(Date.now() - 1000),
        professorId: 'uuid-prof',
      });
      mockPrismaService.aula.update.mockResolvedValue({});

      const result = await service.obterQrCode('aula_1234567890abcdef', user);

      expect(mockPrismaService.aula.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'aula_1234567890abcdef' },
          data: expect.objectContaining({
            qrCodeAtivo: false,
            status: 'CONCLUIDA',
          }),
        }),
      );
      expect(result).toEqual(expect.objectContaining({ qrCodeAtivo: false }));
    });

    it('deve lançar erro se aula não existir', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(service.obterQrCode('invalid-id', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar erro se o usuário for PROFESSOR e não for o dono da aula', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        professorId: 'outro-prof',
      });
      await expect(
        service.obterQrCode('aula_1234567890abcdef', user),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('obterListaDePresenca', () => {
    const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };

    it('deve obter lista de presença com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        professorId: 'uuid-prof',
      });
      mockPrismaService.presencaAula.findMany.mockResolvedValue([
        {
          usuario: { id: 'aluno', nome: 'Aluno Teste' },
          confirmadoEm: new Date(),
        },
      ]);

      const result = await service.obterListaDePresenca(
        'aula_1234567890abcdef',
        user,
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve lançar erro se aula não existir', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue(null);
      await expect(
        service.obterListaDePresenca('invalid-id', user),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se o usuário for PROFESSOR e não for o dono da aula', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'aula_1234567890abcdef',
        professorId: 'outro-prof',
      });
      await expect(
        service.obterListaDePresenca('aula_1234567890abcdef', user),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

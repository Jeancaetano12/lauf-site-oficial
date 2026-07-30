import { Test, TestingModule } from '@nestjs/testing';
import { AulaService } from './aula.service';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { StatusAula } from '@prisma/client';

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
    }
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
    it('deve criar uma aula com sucesso', async () => {
      const dto: CriarAulaDto = {
        professorId: 'uuid-prof',
        titulo: 'Aula Teste',
        local: 'Sala 1',
        status: StatusAula.AGENDADA,
        dataHora: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 1 dia no futuro
      };
      const criadorId = 'uuid-criador';
      const auditoria = 'Teste User';

      mockPrismaService.aula.findFirst.mockResolvedValue(null);
      mockPrismaService.aula.create.mockResolvedValue({ id: 'uuid-aula', ...dto });

      const result = await service.criarAula(dto, criadorId, auditoria);
      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-aula');
      expect(mockPrismaService.aula.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('listarAulas', () => {
    it('deve listar aulas com sucesso', async () => {
      mockPrismaService.aula.findMany.mockResolvedValue([
        { id: 'uuid-aula', titulo: 'Aula Teste' }
      ]);
      const result = await service.listarAulas('Teste User');
      expect(result.length).toBeGreaterThan(0);
      expect(mockPrismaService.aula.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('detalheAula', () => {
    it('deve detalhar uma aula com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        titulo: 'Aula Teste'
      });
      const result = await service.detalheAula('uuid-aula', 'Teste User');
      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-aula');
    });
  });

  describe('atualizarAula', () => {
    it('deve atualizar uma aula com sucesso', async () => {
      const dto: AtualizarAulaDto = {
        titulo: 'Aula Atualizada',
      };
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        status: StatusAula.AGENDADA
      });
      mockPrismaService.aula.findFirst.mockResolvedValue(null); 
      mockPrismaService.aula.update.mockResolvedValue({ id: 'uuid-aula', ...dto });

      const result = await service.atualizarAula('uuid-aula', dto, 'Teste User');
      expect(result).toBeDefined();
      expect(result.titulo).toBe('Aula Atualizada');
    });
  });

  describe('listarProfessores', () => {
    it('deve listar professores com sucesso', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([
        { id: 'uuid-prof', nome: 'Professor Teste' }
      ]);
      const result = await service.listarProfessores('Teste User');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('iniciarChamada', () => {
    it('deve iniciar chamada com sucesso', async () => {
      jest.useFakeTimers();
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        status: StatusAula.AGENDADA,
        professorId: 'uuid-prof'
      });
      mockPrismaService.aula.update.mockResolvedValue({
        id: 'uuid-aula',
        qrCodeAtivo: true,
      });

      const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };
      const result = await service.iniciarChamada('uuid-aula', user);
      expect(result).toBeDefined();
      expect(result.qrCodeAtivo).toBe(true);
      
      jest.clearAllTimers();
      jest.useRealTimers();
    });
  });

  describe('encerrarChamada', () => {
    it('deve encerrar chamada com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        professorId: 'uuid-prof'
      });
      mockPrismaService.aula.update.mockResolvedValue({
        id: 'uuid-aula',
        qrCodeAtivo: false,
        status: StatusAula.CONCLUIDA
      });

      const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };
      const result = await service.encerrarChamada('uuid-aula', user);
      expect(result).toBeDefined();
      expect(result.qrCodeAtivo).toBe(false);
      expect(result.status).toBe(StatusAula.CONCLUIDA);
    });
  });

  describe('obterQrCode', () => {
    it('deve obter QR code com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        qrCodeToken: 'token-abc',
        qrCodeAtivo: true,
        professorId: 'uuid-prof'
      });

      const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };
      const result = await service.obterQrCode('uuid-aula', user);
      expect(result).toBeDefined();
      expect(result.qrCodeAtivo).toBe(true);
      expect(result.qrCodeToken).toBe('token-abc');
    });
  });

  describe('obterListaDePresenca', () => {
    it('deve obter lista de presença com sucesso', async () => {
      mockPrismaService.aula.findUnique.mockResolvedValue({
        id: 'uuid-aula',
        professorId: 'uuid-prof'
      });
      mockPrismaService.presencaAula.findMany.mockResolvedValue([
        {
          usuario: { id: 'uuid-aluno', nome: 'Aluno Teste' },
          confirmadoEm: new Date()
        }
      ]);

      const user = { id: 'uuid-prof', nome: 'Prof', cargo: 'PROFESSOR' };
      const result = await service.obterListaDePresenca('uuid-aula', user);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].id).toBe('uuid-aluno');
    });
  });
});

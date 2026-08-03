import { Test, TestingModule } from '@nestjs/testing';
import { PresencaService } from './presenca.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('PresencaService', () => {
  let service: PresencaService;
  let prisma: PrismaService;

  const mockPrismaService = {
    aula: {
      findFirst: jest.fn(),
    },
    presencaAula: {
      findUnique: jest.fn(),
      create: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresencaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PresencaService>(PresencaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmarPresencaAula', () => {
    const dto: ConfirmarPresencaDto = { token: 'token-abc' };
    const usuarioId = 'uuid-usuario';
    const auditoria = 'Aluno Teste';

    it('deve confirmar a presença com sucesso', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue({
        id: 'uuid-aula', qrCodeToken: 'token-abc', qrCodeAtivo: true, qrCodeExpiraEm: new Date(new Date().getTime() + 10 * 60000)
      });
      mockPrismaService.presencaAula.findUnique.mockResolvedValue(null);
      mockPrismaService.presencaAula.create.mockResolvedValue({ aulaId: 'uuid-aula', usuarioId });

      const result = await service.confirmarPresencaAula(dto, usuarioId, auditoria);
      expect(result).toBeDefined();
      expect(result.aulaId).toBe('uuid-aula');
    });

    it('deve lançar erro se QR code for inválido ou aula não encontrada', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue(null);
      await expect(service.confirmarPresencaAula(dto, usuarioId, auditoria)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se chamada estiver encerrada (qrCodeAtivo=false)', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue({ id: 'uuid-aula', qrCodeAtivo: false });
      await expect(service.confirmarPresencaAula(dto, usuarioId, auditoria)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se o QR Code estiver expirado', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue({ id: 'uuid-aula', qrCodeAtivo: true, qrCodeExpiraEm: new Date(new Date().getTime() - 10000) });
      await expect(service.confirmarPresencaAula(dto, usuarioId, auditoria)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se presença já estiver confirmada', async () => {
      mockPrismaService.aula.findFirst.mockResolvedValue({ id: 'uuid-aula', qrCodeAtivo: true, qrCodeExpiraEm: new Date(new Date().getTime() + 10000) });
      mockPrismaService.presencaAula.findUnique.mockResolvedValue({ aulaId: 'uuid-aula', usuarioId });
      await expect(service.confirmarPresencaAula(dto, usuarioId, auditoria)).rejects.toThrow(ConflictException);
    });
  });
});

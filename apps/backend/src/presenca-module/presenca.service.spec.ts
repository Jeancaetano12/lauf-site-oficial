import { Test, TestingModule } from '@nestjs/testing';
import { PresencaService } from './presenca.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';

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
    it('deve confirmar a presença com sucesso', async () => {
      const dto: ConfirmarPresencaDto = {
        token: 'token-abc',
      };
      const usuarioId = 'uuid-usuario';
      const auditoria = 'Aluno Teste';

      mockPrismaService.aula.findFirst.mockResolvedValue({
        id: 'uuid-aula',
        qrCodeToken: 'token-abc',
        qrCodeAtivo: true,
        qrCodeExpiraEm: new Date(new Date().getTime() + 10 * 60000) // no futuro
      });

      mockPrismaService.presencaAula.findUnique.mockResolvedValue(null);
      mockPrismaService.presencaAula.create.mockResolvedValue({
        aulaId: 'uuid-aula',
        usuarioId: usuarioId,
      });

      const result = await service.confirmarPresencaAula(dto, usuarioId, auditoria);
      expect(result).toBeDefined();
      expect(result.aulaId).toBe('uuid-aula');
      expect(result.usuarioId).toBe(usuarioId);
      expect(mockPrismaService.presencaAula.create).toHaveBeenCalledTimes(1);
    });
  });
});

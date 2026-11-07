import { Test, TestingModule } from '@nestjs/testing';
import { AulaController } from './aula.controller';
import { AulaService } from './aula.service';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { StatusAula } from '@prisma/client';

describe('AulaController', () => {
  let controller: AulaController;
  let service: AulaService;

  const mockAulaService = {
    criarAula: jest.fn(),
    listarAulas: jest.fn(),
    listarProfessores: jest.fn(),
    detalheAula: jest.fn(),
    atualizarAula: jest.fn(),
    iniciarChamada: jest.fn(),
    encerrarChamada: jest.fn(),
    obterQrCode: jest.fn(),
    obterListaDePresenca: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AulaController],
      providers: [
        {
          provide: AulaService,
          useValue: mockAulaService,
        },
      ],
    }).compile();

    controller = module.get<AulaController>(AulaController);
    service = module.get<AulaService>(AulaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockUser = { id: 'uuid-user', nome: 'Teste User', matricula: '123' };

  describe('criarAula', () => {
    it('deve chamar aulaService.criarAula', async () => {
      const dto: CriarAulaDto = {
        professorId: 'uuid-prof',
        titulo: 'Teste',
        local: 'Sala',
        status: StatusAula.AGENDADA,
        dataHora: new Date(),
      };
      mockAulaService.criarAula.mockResolvedValue({ id: 'aula_1234567890abcdef' });

      const result = await controller.criarAula(dto, mockUser);
      expect(result).toBeDefined();
      expect(service.criarAula).toHaveBeenCalledWith(
        dto,
        mockUser.id,
        `${mockUser.nome} (Id: ${mockUser.id})`,
      );
    });
  });

  describe('listarAulas', () => {
    it('deve chamar aulaService.listarAulas', async () => {
      mockAulaService.listarAulas.mockResolvedValue([{ id: 'aula_1234567890abcdef' }]);
      const result = await controller.listarAulas(mockUser);
      expect(result).toBeDefined();
      expect(service.listarAulas).toHaveBeenCalledWith(
        `${mockUser.nome} (Matricula: ${mockUser.matricula})`,
      );
    });
  });

  describe('listarProfessores', () => {
    it('deve chamar aulaService.listarProfessores', async () => {
      mockAulaService.listarProfessores.mockResolvedValue([
        { id: 'uuid-prof' },
      ]);
      const result = await controller.listarProfessores(mockUser);
      expect(result).toBeDefined();
      expect(service.listarProfessores).toHaveBeenCalledWith(
        `${mockUser.nome} (Matricula: ${mockUser.matricula})`,
      );
    });
  });

  describe('detalheAula', () => {
    it('deve chamar aulaService.detalheAula', async () => {
      mockAulaService.detalheAula.mockResolvedValue({ id: 'aula_1234567890abcdef' });
      const result = await controller.detalheAula('aula_1234567890abcdef', mockUser);
      expect(result).toBeDefined();
      expect(service.detalheAula).toHaveBeenCalledWith(
        'aula_1234567890abcdef',
        `${mockUser.nome} (Id: ${mockUser.matricula})`,
      );
    });
  });

  describe('atualizarAula', () => {
    it('deve chamar aulaService.atualizarAula', async () => {
      const dto: AtualizarAulaDto = { titulo: 'Novo' };
      mockAulaService.atualizarAula.mockResolvedValue({ id: 'aula_1234567890abcdef' });
      const result = await controller.atualizarAula('aula_1234567890abcdef', dto, mockUser);
      expect(result).toBeDefined();
      expect(service.atualizarAula).toHaveBeenCalledWith(
        'aula_1234567890abcdef',
        dto,
        `${mockUser.nome} (Id: ${mockUser.id})`,
      );
    });
  });

  describe('iniciarChamada', () => {
    it('deve chamar aulaService.iniciarChamada', async () => {
      mockAulaService.iniciarChamada.mockResolvedValue({ id: 'aula_1234567890abcdef' });
      const result = await controller.iniciarChamada('aula_1234567890abcdef', mockUser);
      expect(result).toBeDefined();
      expect(service.iniciarChamada).toHaveBeenCalledWith(
        'aula_1234567890abcdef',
        mockUser,
      );
    });
  });

  describe('encerrarChamada', () => {
    it('deve chamar aulaService.encerrarChamada', async () => {
      mockAulaService.encerrarChamada.mockResolvedValue({ id: 'aula_1234567890abcdef' });
      const result = await controller.encerrarChamada('aula_1234567890abcdef', mockUser);
      expect(result).toBeDefined();
      expect(service.encerrarChamada).toHaveBeenCalledWith(
        'aula_1234567890abcdef',
        mockUser,
      );
    });
  });

  describe('obterQrCode', () => {
    it('deve chamar aulaService.obterQrCode', async () => {
      mockAulaService.obterQrCode.mockResolvedValue({ id: 'aula_1234567890abcdef' });
      const result = await controller.obterQrCode('aula_1234567890abcdef', mockUser);
      expect(result).toBeDefined();
      expect(service.obterQrCode).toHaveBeenCalledWith('aula_1234567890abcdef', mockUser);
    });
  });

  describe('obterListaDePresenca', () => {
    it('deve chamar aulaService.obterListaDePresenca', async () => {
      mockAulaService.obterListaDePresenca.mockResolvedValue([
        { id: 'uuid-aluno' },
      ]);
      const result = await controller.obterListaDePresenca(
        'aula_1234567890abcdef',
        mockUser,
      );
      expect(result).toBeDefined();
      expect(service.obterListaDePresenca).toHaveBeenCalledWith(
        'aula_1234567890abcdef',
        mockUser,
      );
    });
  });
});

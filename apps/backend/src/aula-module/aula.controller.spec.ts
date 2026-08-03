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
        dataHora: new Date()
      };
      mockAulaService.criarAula.mockResolvedValue({ id: 'uuid-aula' });

      const result = await controller.criarAula(dto, mockUser);
      expect(result).toBeDefined();
      expect(service.criarAula).toHaveBeenCalledWith(dto, mockUser.id, `${mockUser.nome} (Id: ${mockUser.id})`);
    });
  });

  describe('listarAulas', () => {
    it('deve chamar aulaService.listarAulas', async () => {
      mockAulaService.listarAulas.mockResolvedValue([{ id: 'uuid-aula' }]);
      const result = await controller.listarAulas(mockUser);
      expect(result).toBeDefined();
      expect(service.listarAulas).toHaveBeenCalledWith(`${mockUser.nome} (Matricula: ${mockUser.matricula})`);
    });
  });

  describe('listarProfessores', () => {
    it('deve chamar aulaService.listarProfessores', async () => {
      mockAulaService.listarProfessores.mockResolvedValue([{ id: 'uuid-prof' }]);
      const result = await controller.listarProfessores(mockUser);
      expect(result).toBeDefined();
      expect(service.listarProfessores).toHaveBeenCalledWith(`${mockUser.nome} (Matricula: ${mockUser.matricula})`);
    });
  });

  describe('detalheAula', () => {
    it('deve chamar aulaService.detalheAula', async () => {
      mockAulaService.detalheAula.mockResolvedValue({ id: 'uuid-aula' });
      const result = await controller.detalheAula('uuid-aula', mockUser);
      expect(result).toBeDefined();
      expect(service.detalheAula).toHaveBeenCalledWith('uuid-aula', `${mockUser.nome} (Id: ${mockUser.matricula})`);
    });
  });

  describe('atualizarAula', () => {
    it('deve chamar aulaService.atualizarAula', async () => {
      const dto: AtualizarAulaDto = { titulo: 'Novo' };
      mockAulaService.atualizarAula.mockResolvedValue({ id: 'uuid-aula' });
      const result = await controller.atualizarAula('uuid-aula', dto, mockUser);
      expect(result).toBeDefined();
      expect(service.atualizarAula).toHaveBeenCalledWith('uuid-aula', dto, `${mockUser.nome} (Id: ${mockUser.id})`);
    });
  });

  describe('iniciarChamada', () => {
    it('deve chamar aulaService.iniciarChamada', async () => {
      mockAulaService.iniciarChamada.mockResolvedValue({ id: 'uuid-aula' });
      const result = await controller.iniciarChamada('uuid-aula', mockUser);
      expect(result).toBeDefined();
      expect(service.iniciarChamada).toHaveBeenCalledWith('uuid-aula', mockUser);
    });
  });

  describe('encerrarChamada', () => {
    it('deve chamar aulaService.encerrarChamada', async () => {
      mockAulaService.encerrarChamada.mockResolvedValue({ id: 'uuid-aula' });
      const result = await controller.encerrarChamada('uuid-aula', mockUser);
      expect(result).toBeDefined();
      expect(service.encerrarChamada).toHaveBeenCalledWith('uuid-aula', mockUser);
    });
  });

  describe('obterQrCode', () => {
    it('deve chamar aulaService.obterQrCode', async () => {
      mockAulaService.obterQrCode.mockResolvedValue({ id: 'uuid-aula' });
      const result = await controller.obterQrCode('uuid-aula', mockUser);
      expect(result).toBeDefined();
      expect(service.obterQrCode).toHaveBeenCalledWith('uuid-aula', mockUser);
    });
  });

  describe('obterListaDePresenca', () => {
    it('deve chamar aulaService.obterListaDePresenca', async () => {
      mockAulaService.obterListaDePresenca.mockResolvedValue([{ id: 'uuid-aluno' }]);
      const result = await controller.obterListaDePresenca('uuid-aula', mockUser);
      expect(result).toBeDefined();
      expect(service.obterListaDePresenca).toHaveBeenCalledWith('uuid-aula', mockUser);
    });
  });
});

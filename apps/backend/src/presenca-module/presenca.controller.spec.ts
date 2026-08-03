import { Test, TestingModule } from '@nestjs/testing';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';
import { ConfirmarPresencaDto } from './dto/confirmar-presenca.dto';

describe('PresencaController', () => {
  let controller: PresencaController;
  let service: PresencaService;

  const mockPresencaService = {
    confirmarPresencaAula: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresencaController],
      providers: [
        {
          provide: PresencaService,
          useValue: mockPresencaService,
        },
      ],
    }).compile();

    controller = module.get<PresencaController>(PresencaController);
    service = module.get<PresencaService>(PresencaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('confirmarPresencaAula', () => {
    it('deve chamar presencaService.confirmarPresencaAula', async () => {
      const dto: ConfirmarPresencaDto = { token: 'token-abc' };
      const mockUser = { id: 'uuid-user', nome: 'Teste User' };
      
      mockPresencaService.confirmarPresencaAula.mockResolvedValue({ id: 'uuid-presenca' });

      const result = await controller.confirmarPresencaAula(dto, mockUser);
      
      expect(result).toBeDefined();
      expect(service.confirmarPresencaAula).toHaveBeenCalledWith(dto, mockUser.id, `${mockUser.nome} (Id: ${mockUser.id})`);
    });
  });
});

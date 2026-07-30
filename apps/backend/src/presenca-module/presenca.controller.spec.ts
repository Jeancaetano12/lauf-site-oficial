import { Test, TestingModule } from '@nestjs/testing';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';

describe('PresencaController', () => {
  let controller: PresencaController;
  let service: PresencaService;

  const mockPresencaService = {};

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
});

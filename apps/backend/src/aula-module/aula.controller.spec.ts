import { Test, TestingModule } from '@nestjs/testing';
import { AulaController } from './aula.controller';
import { AulaService } from './aula.service';

describe('AulaController', () => {
  let controller: AulaController;
  let service: AulaService;

  const mockAulaService = {};

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
});

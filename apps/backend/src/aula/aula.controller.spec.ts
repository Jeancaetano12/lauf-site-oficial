import { Test, TestingModule } from '@nestjs/testing';
import { AulaController } from './aula.controller';

describe('AulaController', () => {
  let controller: AulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AulaController],
    }).compile();

    controller = module.get<AulaController>(AulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

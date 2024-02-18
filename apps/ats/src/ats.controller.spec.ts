import { Test, TestingModule } from '@nestjs/testing';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';

describe('AtsController', () => {
  let atsController: AtsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AtsController],
      providers: [AtsService],
    }).compile();

    atsController = app.get<AtsController>(AtsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(atsController.getHello()).toBe('Hello World!');
    });
  });
});

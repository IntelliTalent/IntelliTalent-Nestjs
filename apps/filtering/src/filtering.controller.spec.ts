import { Test, TestingModule } from '@nestjs/testing';
import { FilteringController } from './filtering.controller';
import { FilteringService } from './filtering.service';

describe('FilteringController', () => {
  let filteringController: FilteringController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FilteringController],
      providers: [FilteringService],
    }).compile();

    filteringController = app.get<FilteringController>(FilteringController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(filteringController.getHello()).toBe('Hello World!');
    });
  });
});

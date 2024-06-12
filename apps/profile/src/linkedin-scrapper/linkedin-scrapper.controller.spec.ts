import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinScrapperController } from './linkedin-scrapper.controller';

describe('LinkedinScrapperController', () => {
  let controller: LinkedinScrapperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedinScrapperController],
    }).compile();

    controller = module.get<LinkedinScrapperController>(LinkedinScrapperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

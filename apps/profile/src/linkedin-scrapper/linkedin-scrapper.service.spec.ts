import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinScrapperService } from './linkedin-scrapper.service';

describe('LinkedinScrapperService', () => {
  let service: LinkedinScrapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkedinScrapperService],
    }).compile();

    service = module.get<LinkedinScrapperService>(LinkedinScrapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ServicesCommunicationsService } from './services_communications.service';

describe('ServicesCommunicationsService', () => {
  let service: ServicesCommunicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesCommunicationsService],
    }).compile();

    service = module.get<ServicesCommunicationsService>(ServicesCommunicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

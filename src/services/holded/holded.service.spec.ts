import { Test, TestingModule } from '@nestjs/testing';
import { HoldedService } from './holded.service';

describe('HoldedService', () => {
  let service: HoldedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoldedService],
    }).compile();

    service = module.get<HoldedService>(HoldedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

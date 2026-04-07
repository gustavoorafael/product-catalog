import { Test, TestingModule } from '@nestjs/testing';
import { CleaningService } from './cleaning.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ConfigService } from '@nestjs/config';

describe('CleaningService', () => {
  let service: CleaningService;

  const mockProductRepository = {
    query: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue([]),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        AWS_S3_BUCKET_NAME: 'test-bucket',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleaningService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CleaningService>(CleaningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
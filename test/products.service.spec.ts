import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    find: jest.fn().mockResolvedValue([{ name: 'G29', price: 250 }]),
    save: jest.fn().mockImplementation((product) => 
      Promise.resolve({ id: 1, ...product })
    ),
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
        ProductsService,
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

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all products', async () => {
    const products = await service.findAll();
    expect(products).toEqual([{ name: 'G29', price: 250 }]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should create a new product', async () => {
    const dto = { 
      name: 'PS5', 
      price: 500, 
      description: 'A high-performance racing wheel designed for PlayStation and PC, featuring realistic dual-motor force feedback, hand-stitched leather, and stainless steel paddle shifters.', 
      imageUrl: 'https://product-catalog-gustavo-rafael.s3.us-east-1.amazonaws.com/assets/ps5.png' 
    };
    const result = await service.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });
});
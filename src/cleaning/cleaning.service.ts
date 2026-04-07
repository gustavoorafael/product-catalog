import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CleaningService {
  private readonly logger = new Logger(CleaningService.name);
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || '',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCleanup() {
    this.logger.log('--- AUTOMATIC CLEANING ---');

    try {
      await this.clearS3Bucket();

      await this.productRepository.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
      this.logger.log('Database reset.');

      await this.seedInitialProducts();
      
      this.logger.log('--- Successfully cleaned ---');
    } catch (error) {
      this.logger.error('Error during cleaning: ', error);
    }
  }

  private async clearS3Bucket() {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucket) return; 
    
    const listCommand = new ListObjectsV2Command({ Bucket: bucket });
    const list = await this.s3Client.send(listCommand);

    if (list.Contents && list.Contents.length > 0) {
        const objectsToDelete = list.Contents
            .filter((obj) => obj.Key && !obj.Key.startsWith('assets/'))
            .map((obj) => ({ Key: obj.Key }));

        if (objectsToDelete.length > 0) {
            const deleteParams = {
                Bucket: bucket,
                Delete: { Objects: objectsToDelete as { Key: string }[] }, 
            };
            await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
            this.logger.log(`${objectsToDelete.length} files removed from S3.`);
        }
    }
  }

  private async seedInitialProducts() {
    const defaultProducts = [
      {
        name: 'Logitech G29',
        price: 250,
        description: 'A high-performance racing wheel designed for PlayStation and PC, featuring realistic dual-motor force feedback, hand-stitched leather, and stainless steel paddle shifters.',
        imageUrl: 'https://product-catalog-gustavo-rafael.s3.us-east-1.amazonaws.com/assets/g29.png'
      },
      {
        name: 'PlayStation 5',
        price: 450,
        description: 'Is a high-performance video game console, featuring a custom SSD for nearly instant load times, 4K graphics at up to 120fps, and hardware-accelerated ray tracing.',
        imageUrl: 'https://product-catalog-gustavo-rafael.s3.us-east-1.amazonaws.com/assets/ps5.png'
      },
      {
        name: 'AirPods Max',
        price: 550,
        description: 'Premium over-ear wireless headphones by Apple, featuring high-fidelity audio, active noise cancellation, and a distinctive design with aluminum cups, memory foam cushions, and a knit mesh headband for comfort.',
        imageUrl: 'https://product-catalog-gustavo-rafael.s3.us-east-1.amazonaws.com/assets/max.jpg'
      }
    ];

    await this.productRepository.save(defaultProducts);
    this.logger.log('Three standard products were added!');
  }
}
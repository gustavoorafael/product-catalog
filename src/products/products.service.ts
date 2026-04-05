import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') as string,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') as string,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') as string,
      },
    });
  }

  create(createProductDto: CreateProductDto) {
    const newProduct = this.productsRepository.create(createProductDto)
    return this.productsRepository.save(newProduct);
  }

  findAll() {
    return this.productsRepository.find();
  }

  findOne(id: number) {
    return this.productsRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.productsRepository.delete(id);
    return { message: `Produto #${id} removido com sucesso` };
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME') as string;
    const region = this.configService.get<string>('AWS_REGION') as string;
    
    const fileName = `produtos/${id}-${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

    await this.productsRepository.update(id, { imageUrl });

    return this.findOne(id);
  }
}

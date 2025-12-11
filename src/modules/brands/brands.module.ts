import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { CloudflareService } from '../../config/cloudflare-video.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), ProductsModule],
  
  controllers: [BrandsController],
  providers: [BrandsService, CloudflareService],
  exports: [BrandsService],
})
export class BrandsModule { }

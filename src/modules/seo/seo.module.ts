import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Product } from '../products/entities/product-new.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand])],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule { }

import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { Product } from '../products/entities/product-new.entity';
import { CloudflareService } from '../../config/cloudflare-video.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory, Product])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CloudflareService],
  exports: [CategoriesService],
})
export class CategoriesModule { }

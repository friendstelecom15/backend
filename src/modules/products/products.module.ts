import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductCare } from './entities/product.care.entity';
import { NotifyProduct } from './entities/notifyproduct.entity';
import { CloudflareService } from 'src/config/cloudflare-video.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCare, NotifyProduct])],
  controllers: [ProductsController],
  providers: [ProductsService, CloudflareService],
  exports: [ProductsService],
})
export class ProductsModule { }

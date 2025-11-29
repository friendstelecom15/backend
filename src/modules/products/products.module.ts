import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductCare } from './entities/product.care.entity';
import { NotifyProduct } from './entities/notifyproduct.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCare, NotifyProduct])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }

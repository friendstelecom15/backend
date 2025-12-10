import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomecategoryService } from './homecategory.service';
import { HomecategoryController } from './homecategory.controller';
import { HomeCategory } from './entities/homecategory.entity';
import { Product } from '../products/entities/product-new.entity';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [TypeOrmModule.forFeature([HomeCategory, Product]), ProductsModule],
    controllers: [HomecategoryController],
    providers: [HomecategoryService],
    exports: [HomecategoryService],
})
export class HomecategoryModule { }

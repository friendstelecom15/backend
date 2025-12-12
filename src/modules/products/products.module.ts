import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCare } from './entities/product.care.entity';
import { CloudflareService } from 'src/config/cloudflare-video.service';

import { Product as ProductNew } from './entities/product-new.entity';
import { ProductRegion } from './entities/product-region.entity';
import { ProductNetwork } from './entities/product-network.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductStorage } from './entities/product-storage.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVideo } from './entities/product-video.entity';
import { ProductSpecification } from './entities/product-specification.entity';
import { ProductService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCare,
      ProductNew,
      ProductRegion,
      ProductNetwork,
      ProductColor,
      ProductStorage,
      ProductPrice,
      ProductImage,
      ProductVideo,
      ProductSpecification,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductService, CloudflareService],
  exports: [ProductService],
})
export class ProductsModule { }

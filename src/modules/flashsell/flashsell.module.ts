import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashsell } from './flashsell.entity';
import { FlashsellService } from './flashsell.service';
import { FlashsellController } from './flashsell.controller';

import { CloudflareService } from 'src/config/cloudflare-video.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flashsell]), ProductsModule],
  controllers: [FlashsellController],
  providers: [FlashsellService, CloudflareService],
  exports: [FlashsellService],
})
export class FlashsellModule {}

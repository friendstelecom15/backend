import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HerobannerService } from './herobanner.service';
import { HerobannerController } from './herobanner.controller';
import { HeroBanner } from './entities/herobanner.entity';
import { CloudflareService } from 'src/config/cloudflare-video.service';

@Module({
    imports: [TypeOrmModule.forFeature([HeroBanner])],
    controllers: [HerobannerController],
    providers: [HerobannerService, CloudflareService],
    exports: [HerobannerService],
})
export class HerobannerModule { }

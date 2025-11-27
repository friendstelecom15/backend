import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HerobannerService } from './herobanner.service';
import { HerobannerController } from './herobanner.controller';
import { HeroBanner } from './entities/herobanner.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HeroBanner])],
    controllers: [HerobannerController],
    providers: [HerobannerService],
    exports: [HerobannerService],
})
export class HerobannerModule { }

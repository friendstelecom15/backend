import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorporateDeal } from './entities/corporate-deal.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CorporateDealService } from './corporate-deal.service';
import { CorporateDealController } from './corporate-deal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CorporateDeal, Notification])],
  providers: [CorporateDealService],
  controllers: [CorporateDealController],
  exports: [CorporateDealService],
})
export class CorporateDealModule {}

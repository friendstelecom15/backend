import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { DeliveryMethodService } from './delivery-method.service';
import { DeliveryMethodController } from './delivery-method.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryMethod])],
  providers: [DeliveryMethodService],
  controllers: [DeliveryMethodController],
  exports: [DeliveryMethodService],
})
export class DeliveryMethodModule {}

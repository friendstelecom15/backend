import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderitem.entity';
import { OrderItemUnit } from './entities/order-item-unit.entity';

import { NotificationModule } from '../notifications/notification.module';
import { WarrantyModule } from '../warranty/warranty.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderItemUnit]), NotificationModule, WarrantyModule, UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }

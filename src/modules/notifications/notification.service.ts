

import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationReadDto } from './dto/update-notification-read.dto';
import { Notification, NotificationType } from './entities/notification.entity';
import { UsersService } from '../users/users.service';
import { ProductService } from '../products/products.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class NotificationService {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}


  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  //PRODUCT_STOCK_OUT notification can be added similarly if needed
  async createStockOutNotification(productId?: string, userId?: string,) {
    return this.create({
      userId,
      type: NotificationType.PRODUCT_STOCK_OUT as NotificationType,
      title: 'Product Stock Out',
      message: 'A product you are interested in is out of stock.',
      productId,
    });
  }
  // Mark notification as resolved
  async markAsResolved(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const notification = await this.notificationRepository.findOne({ where: { id: _id } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.resolved = true;
    notification.status = 'resolved';
    return this.notificationRepository.save(notification);
  }

// get all notifications for a userid and/or productid (both optional)
async findAllByUserAndProduct(userId?: string, productId?: string) {
  console.log('Finding notifications by userId and productId:', userId, productId);
    const where: any = {};
    if (userId && userId !== 'null' && userId !== '') where.userId = userId;
    if (productId && productId !== 'null' && productId !== '') where.productId = productId;
    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }



  async findAllByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    const notifications = await this.notificationRepository.find({
      order: { createdAt: 'DESC' },
    });
    // Collect unique userIds and productIds
    const userIds = Array.from(new Set(notifications.map(n => n.userId).filter(Boolean)));
    const productIds = Array.from(new Set(notifications.map(n => n.productId).filter(Boolean)));

    // Fetch users and products
    const users = userIds.length
      ? await Promise.all(
          userIds
            .filter((id): id is string => typeof id === 'string' && !!id)
            .map(id => this.usersService.findOne(id).catch(() => null))
        )
      : [];
    const products = productIds.length
      ? await Promise.all(
          productIds
            .filter((id): id is string => typeof id === 'string' && !!id)
            .map(id => this.productService.findById(id).catch(() => null))
        )
      : [];

    // Create lookup maps
    const userMap = new Map(users.filter(Boolean).map(u => [u!.id?.toString?.() ?? String(u!.id), u!.name]));
    const productMap = new Map(products.filter(Boolean).map(p => [p!.id?.toString?.() ?? String(p!.id), p!.name]));

    // Attach names to notifications
    return notifications.map(n => ({
      ...n,
      userName: n.userId ? userMap.get(n.userId) : undefined,
      productName: n.productId ? productMap.get(n.productId) : undefined,
    }));
  }


  async findUnreadByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }



  async markAsRead(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const notification = await this.notificationRepository.findOne({ where: { id: _id } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = true;
    return this.notificationRepository.save(notification);
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.notificationRepository.delete(_id);
    return { success: true };
  }

  // Helper for order update notification
  async notifyOrderUpdate(userId: string, title: string, message: string, link?: string) {
    return this.create({
      userId,
      type: NotificationType.ORDER_UPDATE as NotificationType,
      title,
      message,
      link,
    });
  }

  // Helper for promotion notification
  async notifyPromotion(userId: string, title: string, message: string, link?: string) {
    return this.create({
      userId,
      type: NotificationType.PROMOTION as NotificationType,
      title,
      message,
      link,
    });
  }

  // Helper for giveaway notification
  async notifyGiveaway(userId: string, title: string, message: string, link?: string) {
    return this.create({
      userId,
      type: NotificationType.GIVEAWAY as NotificationType,
      title,
      message,
      link,
    });
  }

  // Helper for system notification
  async notifySystem(userId: string, title: string, message: string, link?: string) {
    return this.create({
      userId,
      type: NotificationType.SYSTEM as NotificationType,
      title,
      message,
      link,
    });
  }
}

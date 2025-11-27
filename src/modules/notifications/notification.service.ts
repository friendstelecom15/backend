

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationReadDto } from './dto/update-notification-read.dto';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }


  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }


  async findAllByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }


  async findUnreadByUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }



  async markAsRead(id: string) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.read = true;
    return this.notificationRepository.save(notification);
  }



  async remove(id: string) {
    await this.notificationRepository.delete(id);
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

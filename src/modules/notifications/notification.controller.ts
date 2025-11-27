import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationReadDto } from './dto/update-notification-read.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  // GET /notifications/:userId - Fetch all notifications for a user
  @Get(':userId')
  async getAll(@Param('userId') userId: string) {
    const notifications = await this.notificationService.findAllByUser(userId);
    return notifications.map(n => ({
      ...n,
      id: n.id?.toString?.() ?? String(n.id),
    }));
  }

  // GET /notifications/:userId/unread - Fetch unread notifications
  @Get(':userId/unread')
  async getUnread(@Param('userId') userId: string) {
    const notifications = await this.notificationService.findUnreadByUser(userId);
    return notifications.map(n => ({
      ...n,
      id: n.id?.toString?.() ?? String(n.id),
    }));
  }

  // POST /notifications - Create new notification (admin or system)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationService.create(createNotificationDto);
    return {
      ...notification,
      id: notification.id?.toString?.() ?? String(notification.id),
    };
  }

  // PATCH /notifications/:id/read - Mark notification as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    return {
      ...notification,
      id: notification.id?.toString?.() ?? String(notification.id),
    };
  }

  // DELETE /notifications/:id - Delete notification
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}

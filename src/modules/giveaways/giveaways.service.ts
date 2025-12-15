
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGiveawayEntryDto } from './dto/giveaway.dto';
import { GiveawayEntry } from './entities/giveawayentry.entity';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class GiveawaysService {

  constructor(
    @InjectRepository(GiveawayEntry)
    private readonly giveawayEntryRepository: Repository<GiveawayEntry>,
    private readonly notificationService: NotificationService,
  ) { }


  async createEntry(dto: CreateGiveawayEntryDto) {
    const entry = this.giveawayEntryRepository.create(dto);
    const saved = await this.giveawayEntryRepository.save(entry);
    // Send notification (admin/global)
    await this.notificationService.create({
      type: NotificationType.GIVEAWAY,
      title: 'New Giveaway Entry',
      message: `A new giveaway entry has been submitted by ${saved.name || saved.email || saved.phone || 'a user'}.`,
      read: false,
      link: '/admin/giveaways',
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: true,
    });
    return {
      ...saved,
      id: saved.id?.toString?.() ?? String(saved.id),
    };
  }


  async findAll() {
    const entries = await this.giveawayEntryRepository.find({ order: { createdAt: 'DESC' } });
    return entries.map(e => ({
      ...e,
      id: e.id?.toString?.() ?? String(e.id),
    }));
  }


  async export() {
    const entries = await this.findAll();
    return entries.map((e) => ({
      Name: e.name,
      Phone: e.phone,
      Email: e.email || '',
      Facebook: e.facebook || '',
      Date: e.createdAt?.toISOString?.() || '',
      Id: e.id,
    }));
  }
}

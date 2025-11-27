
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGiveawayEntryDto } from './dto/giveaway.dto';
import { GiveawayEntry } from './entities/giveawayentry.entity';

@Injectable()
export class GiveawaysService {

  constructor(
    @InjectRepository(GiveawayEntry)
    private readonly giveawayEntryRepository: Repository<GiveawayEntry>,
  ) { }


  async createEntry(dto: CreateGiveawayEntryDto) {
    const entry = this.giveawayEntryRepository.create(dto);
    const saved = await this.giveawayEntryRepository.save(entry);
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

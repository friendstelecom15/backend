import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroBanner } from './entities/herobanner.entity';
import { BottomBanner } from './entities/botombanner.entity';
import { MiddleBanner } from './entities/middelbanner.entity';
import { ObjectId } from 'mongodb';
import { GiveBanner } from './entities/givebanner.entity';

@Injectable()
export class HerobannerService {
  constructor(
    @InjectRepository(HeroBanner)
    private readonly heroBannerRepository: Repository<HeroBanner>,
    @InjectRepository(BottomBanner)
    private readonly bottomBannerRepository: Repository<BottomBanner>,
    @InjectRepository(MiddleBanner)
    private readonly middleBannerRepository: Repository<MiddleBanner>,
    @InjectRepository(GiveBanner)
    private readonly giveBannerRepository: Repository<GiveBanner>,
  ) {}
  // BottomBanner CRUD
  async createBottomBanner(data: { img: string }) {
    const bottomBanner = this.bottomBannerRepository.create(data);
    const saved = await this.bottomBannerRepository.save(bottomBanner);
    return { ...saved, id: String(saved.id) };
  }

  async findAllBottomBanners() {
    const all = await this.bottomBannerRepository.find();
    return all.map((bb) => ({ ...bb, id: String(bb.id) }));
  }

  async findOneBottomBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid BottomBanner id');
      }
    } else {
      objectId = id;
    }
    const bottomBanner = await this.bottomBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!bottomBanner) throw new NotFoundException('BottomBanner not found');
    return { ...bottomBanner, id: String(bottomBanner.id) };
  }

  async updateBottomBanner(id: string | ObjectId, data: { img?: string }) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid BottomBanner id');
      }
    } else {
      objectId = id;
    }
    const bottomBanner = await this.bottomBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!bottomBanner) throw new NotFoundException('BottomBanner not found');
    if (data.img !== undefined) {
      bottomBanner.img = data.img;
    }
    const saved = await this.bottomBannerRepository.save(bottomBanner);
    return { ...saved, id: String(saved.id) };
  }

  async removeBottomBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid BottomBanner id');
      }
    } else {
      objectId = id;
    }
    await this.bottomBannerRepository.delete(objectId);
    return { success: true };
  }

  // MiddleBanner CRUD
  async createMiddleBanner(data: { img: string }) {
    const middleBanner = this.middleBannerRepository.create(data);
    const saved = await this.middleBannerRepository.save(middleBanner);
    return { ...saved, id: String(saved.id) };
  }

  async findAllMiddleBanners() {
    const all = await this.middleBannerRepository.find();
    return all.map((mb) => ({ ...mb, id: String(mb.id) }));
  }

  async findOneMiddleBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid MiddleBanner id');
      }
    } else {
      objectId = id;
    }
    const middleBanner = await this.middleBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!middleBanner) throw new NotFoundException('MiddleBanner not found');
    return { ...middleBanner, id: String(middleBanner.id) };
  }

  async updateMiddleBanner(id: string | ObjectId, data: { img?: string }) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid MiddleBanner id');
      }
    } else {
      objectId = id;
    }
    const middleBanner = await this.middleBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!middleBanner) throw new NotFoundException('MiddleBanner not found');
    if (data.img !== undefined) {
      middleBanner.img = data.img;
    }
    const saved = await this.middleBannerRepository.save(middleBanner);
    return { ...saved, id: String(saved.id) };
  }

  async removeMiddleBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid MiddleBanner id');
      }
    } else {
      objectId = id;
    }
    await this.middleBannerRepository.delete(objectId);
    return { success: true };
  }

  // Create a new HeroBanner
  async create(data: { img: string }) {
    const heroBanner = this.heroBannerRepository.create(data);
    const saved = await this.heroBannerRepository.save(heroBanner);
    return { ...saved, id: String(saved.id) };
  }

  // Get all HeroBanners
  async findAll() {
    const all = await this.heroBannerRepository.find();
    return all.map((hb) => ({ ...hb, id: String(hb.id) }));
  }

  // Get a single HeroBanner by ID
  async findOne(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid HeroBanner id');
      }
    } else {
      objectId = id;
    }
    const heroBanner = await this.heroBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!heroBanner) throw new NotFoundException('HeroBanner not found');
    return { ...heroBanner, id: String(heroBanner.id) };
  }

  // Update a HeroBanner
  async update(id: string | ObjectId, data: { img?: string }) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid HeroBanner id');
      }
    } else {
      objectId = id;
    }
    const heroBanner = await this.heroBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!heroBanner) throw new NotFoundException('HeroBanner not found');
    if (data.img !== undefined) {
      heroBanner.img = data.img;
    }
    const saved = await this.heroBannerRepository.save(heroBanner);
    return { ...saved, id: String(saved.id) };
  }

  // Delete a HeroBanner
  async remove(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid HeroBanner id');
      }
    } else {
      objectId = id;
    }
    await this.heroBannerRepository.delete(objectId);
    return { success: true };
  }

  // GiveBanner CRUD
  async createGiveBanner(data: { img: string }) {
    const giveBanner = this.giveBannerRepository.create(data);
    const saved = await this.giveBannerRepository.save(giveBanner);
    return { ...saved, id: String(saved.id) };
  }

  async findAllGiveBanners() {
    const all = await this.giveBannerRepository.find();
    return all.map((gb) => ({ ...gb, id: String(gb.id) }));
  }

  async findOneGiveBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid GiveBanner id');
      }
    } else {
      objectId = id;
    }
    const giveBanner = await this.giveBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!giveBanner) throw new NotFoundException('GiveBanner not found');
    return { ...giveBanner, id: String(giveBanner.id) };
  }

  async updateGiveBanner(id: string | ObjectId, data: { img?: string }) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid GiveBanner id');
      }
    } else {
      objectId = id;
    }
    const giveBanner = await this.giveBannerRepository.findOne({
      where: { _id: objectId },
    } as any);
    if (!giveBanner) throw new NotFoundException('GiveBanner not found');
    if (data.img !== undefined) {
      giveBanner.img = data.img;
    }
    const saved = await this.giveBannerRepository.save(giveBanner);
    return { ...saved, id: String(saved.id) };
  }

  async removeGiveBanner(id: string | ObjectId) {
    let objectId: ObjectId;
    if (typeof id === 'string') {
      try {
        objectId = new ObjectId(id);
      } catch {
        throw new NotFoundException('Invalid GiveBanner id');
      }
    } else {
      objectId = id;
    }
    await this.giveBannerRepository.delete(objectId);
    return { success: true };
  }
}

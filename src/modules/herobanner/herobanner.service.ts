import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroBanner } from './entities/herobanner.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class HerobannerService {
    constructor(
        @InjectRepository(HeroBanner)
        private readonly heroBannerRepository: Repository<HeroBanner>,
    ) { }

    // Create a new HeroBanner
    async create(data: { img: string }) {
        const heroBanner = this.heroBannerRepository.create(data);
        const saved = await this.heroBannerRepository.save(heroBanner);
        return { ...saved, id: String(saved.id) };
    }

    // Get all HeroBanners
    async findAll() {
        const all = await this.heroBannerRepository.find();
        return all.map(hb => ({ ...hb, id: String(hb.id) }));
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
        const heroBanner = await this.heroBannerRepository.findOne({ where: { _id: objectId } } as any);
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
        const heroBanner = await this.heroBannerRepository.findOne({ where: { _id: objectId } } as any);
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroBanner } from './entities/herobanner.entity';

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
    async findOne(id: string) {
        const heroBanner = await this.heroBannerRepository.findOne({ where: { id } });
        if (!heroBanner) throw new NotFoundException('HeroBanner not found');
        return { ...heroBanner, id: String(heroBanner.id) };
    }

    // Update a HeroBanner
    async update(id: string, data: { img?: string }) {
        await this.heroBannerRepository.update(id, data);
        const updated = await this.heroBannerRepository.findOne({ where: { id } });
        if (!updated) throw new NotFoundException('HeroBanner not found');
        return { ...updated, id: String(updated.id) };
    }

    // Delete a HeroBanner
    async remove(id: string) {
        await this.heroBannerRepository.delete(id);
        return { success: true };
    }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { Brand } from './entities/brand.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class BrandsService {

  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) { }


  async create(dto: CreateBrandDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const brand = this.brandRepository.create({ ...dto, slug });
    return this.brandRepository.save(brand);
  }


  async findAll() {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }


  async findOne(slug: string) {
    const brand = await this.brandRepository.findOne({ where: { slug } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }


  // To implement findProducts, use ProductRepository in controller/service if needed
  async findProducts(slug: string) {
    const brand = await this.brandRepository.findOne({ where: { slug } });
    if (!brand) throw new NotFoundException('Brand not found');
    // Product lookup should be handled in ProductService
    return [];
  }



  async update(id: string | ObjectId, dto: UpdateBrandDto) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const data: UpdateBrandDto & { slug?: string } = { ...dto };
    if (dto.name) {
      data.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    }
    await this.brandRepository.update(_id, data);
    return this.brandRepository.findOne({ where: { id: _id } });
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.brandRepository.delete(_id);
    return { success: true };
  }


  async getFeatured() {
    return this.brandRepository.find({
      take: 12,
      order: { name: 'ASC' },
    });
  }
}


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

  // 🔍 Check if brand with same name OR slug already exists
  const exists = await this.brandRepository.findOne({
    where: [{ name: dto.name }, { slug }],
  });

  if (exists) {
    throw new BadRequestException(
      'This brand is already added. Please use another name.'
    );
  }

  const brand = this.brandRepository.create({ ...dto, slug });
  return this.brandRepository.save(brand);
}



  async findAll() {
    const brands = await this.brandRepository.find({ order: { name: 'ASC' } });
    return brands.map(brand => ({
      id: brand.id?.toString?.() ?? String(brand.id),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));
  }


  async findOne(idOrSlug: string) {
    let brand;
    try {
      // Try to treat as ObjectId
      const objectId = new ObjectId(idOrSlug);
      brand = await this.brandRepository.findOne({ where: { _id: objectId } } as any);
    } catch {
      // Fallback to slug
      brand = await this.brandRepository.findOne({ where: { slug: idOrSlug } });
    }
    if (!brand) throw new NotFoundException('Brand not found');
    return {
      id: brand.id?.toString?.() ?? String(brand.id),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
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
    const brand = await this.brandRepository.findOne({ where: { _id } } as any);
    if (!brand) throw new NotFoundException('Brand not found');
    return {
      id: brand.id?.toString?.() ?? String(brand.id),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.brandRepository.delete(_id);
    return { success: true };
  }


  async getFeatured() {
    const brands = await this.brandRepository.find({
      take: 12,
      order: { name: 'ASC' },
    });
    return brands.map(brand => ({
      id: brand.id?.toString?.() ?? String(brand.id),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));
  }
}

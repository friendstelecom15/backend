
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(dto: CreateProductDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product = this.productRepository.create({
      ...dto,
      slug,
      tags: dto.tags || [],
      badges: dto.badges || [],
      gallery: dto.gallery || [],
      seoKeywords: dto.seoKeywords || [],
    });
    return this.productRepository.save(product);
  }

  async findAll(filters?: {
    categoryId?: string;
    brandId?: string;
    isNew?: boolean;
    isHot?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.brandId) where.brandId = filters.brandId;
    if (filters?.isNew !== undefined) where.isNew = filters.isNew;
    if (filters?.isHot !== undefined) where.isHot = filters.isHot;
    if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters?.minPrice || filters?.maxPrice) {
      where.basePrice = {};
      if (filters?.minPrice) where.basePrice.$gte = filters.minPrice;
      if (filters?.maxPrice) where.basePrice.$lte = filters.maxPrice;
    }
    // Note: TypeORM does not support array contains natively for MongoDB, so tags filter may need custom query
    // For now, ignore tags filter or implement if needed
    return this.productRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  async findOne(slug: string) {
    const product = await this.productRepository.findOne({ where: { slug } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }


  async update(id: string, dto: UpdateProductDto) {
    await this.productRepository.update(id, dto);
    return this.productRepository.findOne({ where: { id } });
  }


  async remove(id: string) {
    await this.productRepository.delete(id);
    return { success: true };
  }

  async getFeatured() {
    return this.productRepository.find({
      where: { isFeatured: true },
      take: 12,
      order: { createdAt: 'DESC' },
    });
  }

  async getNew() {
    return this.productRepository.find({
      where: { isNew: true },
      take: 12,
      order: { createdAt: 'DESC' },
    });
  }

  async getHot() {
    return this.productRepository.find({
      where: { isHot: true },
      take: 12,
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string) {
    return this.productRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { shortDescription: Like(`%${query}%`) },
        // tags: TypeORM does not support array search for MongoDB, so skip for now
      ],
      take: 20,
    });
  }
}

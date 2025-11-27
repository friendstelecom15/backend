
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
} from './dto/category.dto';
import { Category } from './entities/category.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }


  async create(dto: CreateCategoryDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const category = this.categoryRepository.create({ ...dto, slug });
    return this.categoryRepository.save(category);
  }


  async findAll() {
    return this.categoryRepository.find({ order: { priority: 'ASC' } });
  }


  async findOne(slug: string) {
    const category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }


  // To implement findProducts, use ProductRepository in controller/service if needed
  async findProducts(slug: string, filters?: CategoryFilterDto) {
    const category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    // Product lookup should be handled in ProductService
    return [];
  }



  async update(id: string | ObjectId, dto: UpdateCategoryDto) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      data.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    }
    await this.categoryRepository.update(_id, data);
    return this.categoryRepository.findOne({ where: { id: _id } });
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.categoryRepository.delete(_id);
    return { success: true };
  }


  async getFeatured() {
    return this.categoryRepository.find({
      where: { priority: 10 },
      order: { priority: 'ASC' },
      take: 6,
    });
  }
}

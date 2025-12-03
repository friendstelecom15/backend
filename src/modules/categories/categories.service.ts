
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
} from './dto/category.dto';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async getById(id: string): Promise<Category | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.categoryRepository.findOne({ where: { _id } } as any);
  }
  // SUBCATEGORY METHODS
  async createSubcategory(dto: any) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const subcategory = this.subcategoryRepository.create({ ...dto, slug });
    return this.subcategoryRepository.save(subcategory);
  }

  async updateSubcategory(id: string, dto: any) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      data.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    }
    await this.subcategoryRepository.update(_id, data);
    return this.subcategoryRepository.findOne({ where: { _id } } as any);
  }

  async getSubcategoriesByCategory(categoryId: string) {
    return this.subcategoryRepository.find({ where: { categoryId } });
  }

  async getSubcategory(id: string) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.subcategoryRepository.findOne({ where: { _id } } as any);
  }


  async create(dto: CreateCategoryDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const category = this.categoryRepository.create({ ...dto, slug });
    return this.categoryRepository.save(category);
  }


  async findAll(options?: { relations?: string[] }) {
    return this.categoryRepository.find({
      order: { priority: 'ASC' },
      ...(options?.relations ? { relations: options.relations } : {}),
    });
  }


  async findOne(slug: string, options?: { relations?: string[] }) {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      ...(options?.relations ? { relations: options.relations } : {}),
    });
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
    return this.categoryRepository.findOne({ where: { _id } } as any);
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

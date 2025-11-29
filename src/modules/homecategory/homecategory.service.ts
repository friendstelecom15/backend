import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeCategory } from './entities/homecategory.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class HomecategoryService {
  constructor(
    @InjectRepository(HomeCategory)
    private readonly homeCategoryRepository: Repository<HomeCategory>,
  ) { }

  // Create a new HomeCategory
  async create(data: {
    name: string;
    priority?: number;
    categoryIds?: string[];
    productIds?: string[];
  }) {
    const homeCategory = this.homeCategoryRepository.create({
      name: data.name,
      priority: data.priority,
      categoryIds: data.categoryIds || [],
      productIds: data.productIds || [],
    });
    const saved = await this.homeCategoryRepository.save(homeCategory);
    return { ...saved, id: String(saved.id) };
  }


  // Get all HomeCategories (relations are manual, so just return the entity)
  async findAll() {
    const all = await this.homeCategoryRepository.find({ order: { priority: 'ASC' } });
    return all.map(hc => ({ ...hc, id: String(hc.id) }));
  }


  // Get a single HomeCategory by ID
  async findOne(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const homeCategory = await this.homeCategoryRepository.findOne({ where: { id: _id } });
    if (!homeCategory) throw new NotFoundException('HomeCategory not found');
    return { ...homeCategory, id: String(homeCategory.id) };
  }


  // Update a HomeCategory
  async update(id: string | ObjectId, data: {
    name?: string;
    priority?: number;
    categoryIds?: string[];
    productIds?: string[];
  }) {
    let _id: ObjectId;
    if (typeof id === 'string' && id.length === 24) {
      _id = new ObjectId(id);
    } else if (id instanceof ObjectId) {
      _id = id;
    } else {
      throw new NotFoundException('HomeCategory not found');
    }
    // Try both id and _id fields for MongoDB compatibility
    let homeCategory = await this.homeCategoryRepository.findOne({ where: { id: _id } });
    if (!homeCategory) {
      homeCategory = await this.homeCategoryRepository.findOne({ where: { _id: _id } } as any);
    }
    if (!homeCategory) throw new NotFoundException('HomeCategory not found');
    if (data.name !== undefined) homeCategory.name = data.name;
    if (data.priority !== undefined) homeCategory.priority = data.priority;
    if (data.categoryIds !== undefined) homeCategory.categoryIds = data.categoryIds;
    if (data.productIds !== undefined) homeCategory.productIds = data.productIds;
    const saved = await this.homeCategoryRepository.save(homeCategory);
    return { ...saved, id: String(saved.id) };
  }


  // Assign products to a HomeCategory (update productIds array)
  async assignProducts(homeCategoryId: string | ObjectId, productIds: string[]) {
    const _id = typeof homeCategoryId === 'string' ? new ObjectId(homeCategoryId) : homeCategoryId;
    const homeCategory = await this.homeCategoryRepository.findOne({ where: { id: _id } });
    if (!homeCategory) throw new NotFoundException('HomeCategory not found');
    homeCategory.productIds = productIds;
    const saved = await this.homeCategoryRepository.save(homeCategory);
    return { ...saved, id: String(saved.id) };
  }


  // Delete a HomeCategory
  async remove(id: string | ObjectId) {
    let _id: ObjectId;
    if (typeof id === 'string' && id.length === 24) {
      _id = new ObjectId(id);
    } else if (id instanceof ObjectId) {
      _id = id;
    } else {
      throw new NotFoundException('HomeCategory not found');
    }
    let homeCategory = await this.homeCategoryRepository.findOne({ where: { id: _id } });
    if (!homeCategory) {
      homeCategory = await this.homeCategoryRepository.findOne({ where: { _id: _id } } as any);
    }
    if (!homeCategory) throw new NotFoundException('HomeCategory not found');
    await this.homeCategoryRepository.delete(_id);
    return { message: 'HomeCategory deleted successfully' };
  }

}

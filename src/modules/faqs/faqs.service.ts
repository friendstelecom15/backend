
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FAQ } from './entities/faq.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class FaqsService {

  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }


  async create(dto: CreateFaqDto) {
    const faq = this.faqRepository.create(dto);
    const savedFaq = await this.faqRepository.save(faq);

    // If productIds are provided, update those products' faqIds
    if (dto.productIds && Array.isArray(dto.productIds)) {
      await Promise.all(
        dto.productIds.map(async (productId) => {
          const product = await this.productRepository.findOne({ where: { id: new ObjectId(productId) } });
          if (product) {
            if (!product.faqIds) product.faqIds = [];
            if (!product.faqIds.includes(savedFaq.id.toString())) {
              product.faqIds.push(savedFaq.id.toString());
              await this.productRepository.save(product);
            }
          }
        })
      );
    }
    // If categoryIds are provided, update those categories' faqIds
    if (dto.categoryIds && Array.isArray(dto.categoryIds)) {
      const categoryRepo = this.productRepository.manager.getRepository('Category');
      await Promise.all(
        dto.categoryIds.map(async (categoryId) => {
          const category = await categoryRepo.findOne({ where: { id: new ObjectId(categoryId) } });
          if (category) {
            if (!category.faqIds) category.faqIds = [];
            if (!category.faqIds.includes(savedFaq.id.toString())) {
              category.faqIds.push(savedFaq.id.toString());
              await categoryRepo.save(category);
            }
          }
        })
      );
    }
    return savedFaq;
  }


  async findAll() {
    return this.faqRepository.find({
      order: {
        orderIndex: 'ASC',
        createdAt: 'DESC',
      },
    });
  }


  async findByProduct(productId: string) {
    return this.faqRepository.find({
      where: { productIds: In([productId]) },
      order: { createdAt: 'DESC' },
    });
  }



  async findOne(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const faq = await this.faqRepository.findOne({ where: { _id: _id } } as any);
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }



  async update(id: string | ObjectId, dto: UpdateFaqDto) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.faqRepository.update(_id, dto);
    const updatedFaq = await this.faqRepository.findOne({ where: { _id: _id } } as any);

    // Sync productIds if provided
    if (dto.productIds && Array.isArray(dto.productIds)) {
      // Remove this FAQ from all products' faqIds first
      const allProducts = await this.productRepository.find();
      await Promise.all(
        allProducts.map(async (product) => {
          if (product.faqIds && product.faqIds.includes(_id.toString())) {
            product.faqIds = product.faqIds.filter(fid => fid !== _id.toString());
            await this.productRepository.save(product);
          }
        })
      );
      // Add this FAQ to selected products' faqIds
      await Promise.all(
        dto.productIds.map(async (productId) => {
          const product = await this.productRepository.findOne({ where: { id: new ObjectId(productId) } });
          if (product) {
            if (!product.faqIds) product.faqIds = [];
            if (!product.faqIds.includes(_id.toString())) {
              product.faqIds.push(_id.toString());
              await this.productRepository.save(product);
            }
          }
        })
      );
    }

    // Sync categoryIds if provided
    if (dto.categoryIds && Array.isArray(dto.categoryIds)) {
      const categoryRepo = this.productRepository.manager.getRepository('Category');
      // Remove this FAQ from all categories' faqIds first
      const allCategories = await categoryRepo.find();
      await Promise.all(
        allCategories.map(async (category) => {
          if (category.faqIds && category.faqIds.includes(_id.toString())) {
            category.faqIds = category.faqIds.filter(fid => fid !== _id.toString());
            await categoryRepo.save(category);
          }
        })
      );
      // Add this FAQ to selected categories' faqIds
      await Promise.all(
        dto.categoryIds.map(async (categoryId) => {
          const category = await categoryRepo.findOne({ where: { id: new ObjectId(categoryId) } });
          if (category) {
            if (!category.faqIds) category.faqIds = [];
            if (!category.faqIds.includes(_id.toString())) {
              category.faqIds.push(_id.toString());
              await categoryRepo.save(category);
            }
          }
        })
      );
    }

    return updatedFaq;
  }



  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.faqRepository.delete(_id);
    return { success: true };
  }
}

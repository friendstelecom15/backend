import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CareCreateDto } from './dto/care-create.dto';
import { Product } from './entities/product.entity';
import { ProductCare } from './entities/product.care.entity';
import { NotifyProduct } from './entities/notifyproduct.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCare)
    private readonly productCareRepository: Repository<ProductCare>,
    @InjectRepository(NotifyProduct)
    private readonly notifyProductRepository: Repository<NotifyProduct>,
  ) { }
    // NotifyProduct CRUD
    async createNotify(dto: Partial<NotifyProduct>) {
      const notify = this.notifyProductRepository.create(dto);
      return this.notifyProductRepository.save(notify);
    }

    async updateNotify(id: string | ObjectId, dto: Partial<NotifyProduct>) {
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      await this.notifyProductRepository.update(_id, dto);
      return this.notifyProductRepository.findOne({ where: { id: _id } });
    }

    async getNotifies(productId?: string) {
      const where = productId ? { productId } : {};
      return this.notifyProductRepository.find({ where });
    }

    async getNotifyById(id: string | ObjectId) {
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const notify = await this.notifyProductRepository.findOne({ where: { id: _id } });
      if (!notify) throw new NotFoundException('NotifyProduct not found');
      return notify;
    }

    async removeNotify(id: string | ObjectId) {
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      await this.notifyProductRepository.delete(_id);
      return { success: true };
    }
  // Product Care CRUD
  /**
   * Create a ProductCare plan that can be assigned to multiple products and categories.
   * But, a product/category can have only one care plan of this type.
   */
  async createCare(dto: CareCreateDto) {
    const normalized: Partial<ProductCare> = { ...dto };
    if (dto.productId) {
      normalized.productIds = [dto.productId];
    }
    if (dto.categoryId) {
      normalized.categoryIds = [dto.categoryId];
    }
    if (normalized.productIds && normalized.productIds.length > 0) {
      for (const productId of normalized.productIds) {
        const exists = await this.productCareRepository.findOne({ where: { productIds: productId } });
        if (exists) {
          let productName = productId;
          try {
            let product: Product | null = null;
            if (typeof productId === 'string' && productId.length === 24) {
              const lookupId = new ObjectId(productId);
              product = await this.productRepository.findOne({ where: { id: lookupId } });
              if (!product) {
                product = await this.productRepository.findOne({ where: { _id: lookupId } } as any);
              }
            }
            if (product && product.name) productName = product.name;
          } catch (e) { /* ignore */ }
          throw new BadRequestException(`Product (${productName}) already has a care plan.`);
        }
      }
    }
    // Check for duplicate care for any category
    if (normalized.categoryIds && normalized.categoryIds.length > 0) {
      for (const categoryId of normalized.categoryIds) {
        const exists = await this.productCareRepository.findOne({ where: { categoryIds: categoryId } });
        if (exists) {
          // Get category name for error
          let categoryName = categoryId;
          try {
            // Try to find by id or _id
            let category: any = null;
            if (typeof categoryId === 'string' && categoryId.length === 24) {
              const lookupId = new ObjectId(categoryId);
              const categoryRepo = this.productRepository.manager.getRepository('Category');
              category = await categoryRepo.findOne({ where: { id: lookupId } });
              if (!category) {
                category = await categoryRepo.findOne({ where: { _id: lookupId } } as any);
              }
            }
            if (category && category.name) categoryName = category.name;
          } catch (e) { /* ignore */ }
          throw new BadRequestException(`Category (${categoryName}) already has a care plan.`);
        }
      }
    }
    const care = this.productCareRepository.create(normalized);
    return this.productCareRepository.save(care);
  }

  async updateCare(id: string | ObjectId, dto: Partial<ProductCare>) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.productCareRepository.update(_id, dto);
    const updated = await this.productCareRepository.findOne({ where: { id: _id } });
    if (!updated) return updated;
    // Attach product/category names like createCare
    let productNames: string[] = [];
    let categoryNames: string[] = [];
    if (updated.productIds && updated.productIds.length > 0) {
      const products = await this.productRepository.findByIds(updated.productIds);
      productNames = products.map(p => p.name);
    }
    if (updated.categoryIds && updated.categoryIds.length > 0) {
      const categories = await this.productRepository.manager.getRepository('Category').findByIds(updated.categoryIds);
      categoryNames = categories.map((c: any) => c.name);
    }
    return {
      ...updated,
      productNames,
      categoryNames,
    };
  }

  async getCares(productId?: string) {
    // If productId is provided, find all care plans where productIds array contains productId
    const where = productId ? { productIds: productId } : {};
    return this.productCareRepository.find({ where });
  }

  async getCareById(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const care = await this.productCareRepository.findOne({ where: { id: _id } });
    if (!care) throw new NotFoundException('Product care not found');
    return care;
  }

  async removeCare(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.productCareRepository.delete(_id);
    return { success: true };
  }

  async create(dto: CreateProductDto) {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Invalid product data');
    }
    if (!dto.name) {
      throw new BadRequestException('Product name is required');
    }
    const product = this.productRepository.create({
      
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      categoryId: dto.categoryId,
      brandId: dto.brandId,
      productCode: dto.productCode,
      sku: dto.sku,
      // Review/rating fields
      rating: dto.rating,
      reviewCount: dto.reviewCount,
      averageRating: dto.averageRating,
      rewardsPoints: dto.rewardsPoints,
      // Pricing
      basePrice: dto.basePrice,
      discountPrice: dto.discountPrice,
      discountPercent: dto.discountPercent,
      price: dto.price,
      minBookingPrice: dto.minBookingPrice,
      purchasePoints: dto.purchasePoints,
      stock: dto.stock,
      thumbnail: dto.thumbnail,
      gallery: dto.gallery || [],
      image: dto.image || [],
      video: dto.video,
      variants: dto.variants || [],
      regions: dto.regions || [],
      colors: dto.colors || [],
      networks: dto.networks || [],
      sizes: dto.sizes || [],
      plugs: dto.plugs || [],
      emiAvailable: dto.emiAvailable,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoKeywords: dto.seoKeywords || [],
      tags: dto.tags || [],
      badges: dto.badges || [],
      highlights: dto.highlights || [],
      dynamicInputs: dto.dynamicInputs,
      details: dto.details,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      metaKeywords: dto.metaKeywords || [],
      campaigns: dto.campaigns,
      // Specifications
      specifications: dto.specifications || [],
      // FAQ
      faqIds: dto.faqIds || [],
      status: dto.status !== undefined ? dto.status : true,
    });
    console.log('Creating product:', product);
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
    const take = filters?.limit ? parseInt(filters.limit as any, 10) : 50;
    const skip = filters?.offset ? parseInt(filters.offset as any, 10) : 0;
    return this.productRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
  }

  async findOne(slug: string) {
    const product = await this.productRepository.findOne({ where: { slug } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }


  async update(id: string | ObjectId, dto: UpdateProductDto) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.productRepository.update(_id, dto);
    return this.productRepository.findOne({ where: { id: _id } });
  }


  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.productRepository.delete(_id);
    return { success: true };
  }

  async getFeatured() {
    return this.productRepository.find({
      where: { isFeatured: true },
      take: 12,
      order: { createdAt: 'DESC' },
    });
  }



  async search(query: string) {
    return this.productRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        // tags: TypeORM does not support array search for MongoDB, so skip for now
      ],
      take: 20,
    });
  }
}

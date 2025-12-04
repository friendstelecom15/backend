import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ObjectId } from 'mongodb';
import { CreateProductNewDto } from './dto/create-product-new.dto';
import { UpdateProductNewDto } from './dto/update-product-new.dto';
import { Product } from './entities/product-new.entity';
import { ProductRegion } from './entities/product-region.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductStorage } from './entities/product-storage.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVideo } from './entities/product-video.entity';
import { SpecGroup } from './entities/spec-group.entity';
import { ProductSpecification } from './entities/product-specification.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(SpecGroup)
    private readonly specGroupRepository: Repository<SpecGroup>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a complete product with all variants, pricing, images, specs in a single transaction
   */
  async create(dto: CreateProductNewDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Product
      const product = queryRunner.manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        categoryId: dto.categoryId ? new ObjectId(dto.categoryId) : undefined,
        brandId: dto.brandId ? new ObjectId(dto.brandId) : undefined,
        productCode: dto.productCode,
        sku: dto.sku,
        warranty: dto.warranty,
        // Simple product fields
        price: dto.price,
        comparePrice: dto.comparePrice,
        stockQuantity: dto.stockQuantity,
        lowStockAlert: dto.lowStockAlert,
        isActive: dto.isActive ?? true,
        isOnline: dto.isOnline ?? true,
        isPos: dto.isPos ?? true,
        isPreOrder: dto.isPreOrder ?? false,
        isOfficial: dto.isOfficial ?? false,
        freeShipping: dto.freeShipping ?? false,
        rewardPoints: dto.rewardPoints ?? 0,
        minBookingPrice: dto.minBookingPrice ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
        seoCanonical: dto.seoCanonical,
        tags: dto.tags,
        faqIds: dto.faqIds ? dto.faqIds.map(id => new ObjectId(id)) : undefined,
      });

      const savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Create Direct Colors (for products without regions)
      if (dto.directColors && dto.directColors.length > 0) {
        for (const colorDto of dto.directColors) {
          const color = queryRunner.manager.create(ProductColor, {
            productId: savedProduct.id,
            colorName: colorDto.colorName,
            colorImage: colorDto.colorImage,
            hasStorage: colorDto.hasStorage ?? true,
            singlePrice: colorDto.singlePrice,
            singleComparePrice: colorDto.singleComparePrice,
            singleStockQuantity: colorDto.singleStockQuantity,
            features: colorDto.features,
            displayOrder: colorDto.displayOrder ?? 0,
          });
          const savedColor = await queryRunner.manager.save(ProductColor, color);

          // Create storages if hasStorage = true
          if (colorDto.hasStorage && colorDto.storages && colorDto.storages.length > 0) {
            for (const storageDto of colorDto.storages) {
              const storage = queryRunner.manager.create(ProductStorage, {
                colorId: savedColor.id,
                storageSize: storageDto.storageSize,
                displayOrder: storageDto.displayOrder ?? 0,
              });
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              // Create Price for this storage
              const price = new ProductPrice();
              price.storageId = savedStorage.id;
              price.regularPrice = storageDto.price.regularPrice;
              price.comparePrice = storageDto.price.comparePrice;
              price.discountPrice = storageDto.price.discountPrice;
              price.discountPercent = storageDto.price.discountPercent;
              price.campaignPrice = storageDto.price.campaignPrice;
              price.campaignStart = storageDto.price.campaignStart
                ? new Date(storageDto.price.campaignStart)
                : undefined;
              price.campaignEnd = storageDto.price.campaignEnd
                ? new Date(storageDto.price.campaignEnd)
                : undefined;
              price.stockQuantity = storageDto.price.stockQuantity;
              price.lowStockAlert = storageDto.price.lowStockAlert ?? 5;
              await queryRunner.manager.save(ProductPrice, price);
            }
          }
        }
      }

      // 3. Create Regions → Colors → Storages → Prices (for region-based products)
      if (dto.regions && dto.regions.length > 0) {
        for (const regionDto of dto.regions) {
          const region = queryRunner.manager.create(ProductRegion, {
            productId: savedProduct.id,
            regionName: regionDto.regionName,
            isDefault: regionDto.isDefault ?? false,
            displayOrder: regionDto.displayOrder ?? 0,
          });
          const savedRegion = await queryRunner.manager.save(ProductRegion, region);

          if (regionDto.colors && regionDto.colors.length > 0) {
            for (const colorDto of regionDto.colors) {
              const color = queryRunner.manager.create(ProductColor, {
                regionId: savedRegion.id,
                colorName: colorDto.colorName,
                colorImage: colorDto.colorImage,
                hasStorage: colorDto.hasStorage ?? true,
                singlePrice: colorDto.singlePrice,
                singleComparePrice: colorDto.singleComparePrice,
                singleStockQuantity: colorDto.singleStockQuantity,
                features: colorDto.features,
                displayOrder: colorDto.displayOrder ?? 0,
              });
              const savedColor = await queryRunner.manager.save(ProductColor, color);

              // Create storages only if hasStorage = true
              if (colorDto.hasStorage && colorDto.storages && colorDto.storages.length > 0) {
                for (const storageDto of colorDto.storages) {
                  const storage = queryRunner.manager.create(ProductStorage, {
                    colorId: savedColor.id,
                    storageSize: storageDto.storageSize,
                    displayOrder: storageDto.displayOrder ?? 0,
                  });
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  // Create Price for this storage
                  const price = new ProductPrice();
                  price.storageId = savedStorage.id;
                  price.regularPrice = storageDto.price.regularPrice;
                  price.comparePrice = storageDto.price.comparePrice;
                  price.discountPrice = storageDto.price.discountPrice;
                  price.discountPercent = storageDto.price.discountPercent;
                  price.campaignPrice = storageDto.price.campaignPrice;
                  price.campaignStart = storageDto.price.campaignStart
                    ? new Date(storageDto.price.campaignStart)
                    : undefined;
                  price.campaignEnd = storageDto.price.campaignEnd
                    ? new Date(storageDto.price.campaignEnd)
                    : undefined;
                  price.stockQuantity = storageDto.price.stockQuantity;
                  price.lowStockAlert = storageDto.price.lowStockAlert ?? 5;
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      // 4. Create Images
      if (dto.images && dto.images.length > 0) {
        for (const imageDto of dto.images) {
          const image = queryRunner.manager.create(ProductImage, {
            productId: savedProduct.id,
            imageUrl: imageDto.imageUrl,
            isThumbnail: imageDto.isThumbnail ?? false,
            altText: imageDto.altText,
            displayOrder: imageDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductImage, image);
        }
      }

      // 5. Create Videos
      if (dto.videos && dto.videos.length > 0) {
        for (const videoDto of dto.videos) {
          const video = queryRunner.manager.create(ProductVideo, {
            productId: savedProduct.id,
            videoUrl: videoDto.videoUrl,
            videoType: videoDto.videoType,
            displayOrder: videoDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductVideo, video);
        }
      }

      // 6. Create Specifications
      if (dto.specifications && dto.specifications.length > 0) {
        for (const specGroupDto of dto.specifications) {
          // Find or create spec group
          let specGroup = await queryRunner.manager.findOne(SpecGroup, {
            where: { groupName: specGroupDto.groupName },
          });

          if (!specGroup) {
            specGroup = queryRunner.manager.create(SpecGroup, {
              groupName: specGroupDto.groupName,
              displayOrder: specGroupDto.displayOrder ?? 0,
              icon: specGroupDto.icon,
            });
            specGroup = await queryRunner.manager.save(SpecGroup, specGroup);
          }

          // Create specifications for this group
          if (specGroupDto.specs && specGroupDto.specs.length > 0) {
            for (const spec of specGroupDto.specs) {
              const productSpec = queryRunner.manager.create(ProductSpecification, {
                productId: savedProduct.id,
                specGroupId: specGroup.id,
                specKey: spec.specKey,
                specValue: spec.specValue,
                displayOrder: spec.displayOrder ?? 0,
              });
              await queryRunner.manager.save(ProductSpecification, productSpec);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      // Return complete product with all relations
      return this.findOne(savedProduct.slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to create product: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all products with filters and pagination
   */
  async findAll(filters?: {
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
    isOnline?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const whereConditions: any = {};
    
    if (filters?.categoryId) {
      whereConditions.categoryId = new ObjectId(filters.categoryId);
    }
    if (filters?.brandId) {
      whereConditions.brandId = new ObjectId(filters.brandId);
    }
    if (filters?.isActive !== undefined) {
      whereConditions.isActive = filters.isActive;
    }
    if (filters?.isOnline !== undefined) {
      whereConditions.isOnline = filters.isOnline;
    }

    const products = await this.productRepository.find({
      where: whereConditions,
      take: filters?.limit,
      skip: filters?.offset,
      order: { createdAt: 'DESC' },
    });

    // For MongoDB, we need to load relations separately
    const productsWithRelations = await Promise.all(
      products.map(async (product) => {
        return this.productRepository.findOne({
          where: { id: product.id } as any,
          relations: ['images', 'videos', 'regions', 'directColors', 'specifications'],
        });
      }),
    );

    return productsWithRelations.filter(p => p !== null).map((product) => this.formatProductResponse(product!));
  }

  /**
   * Get single product by slug with all details
   */
  async findOne(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['images', 'videos', 'regions', 'directColors', 'specifications'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProductResponse(product);
  }

  /**
   * Get specific variant price
   */
  async getVariantPrice(
    productId: string,
    regionId?: string,
    colorId?: string,
    storageId?: string,
  ) {
    // For MongoDB, we need to manually query and filter
    // This is a simplified version - you may need to implement more complex logic
    const product = await this.productRepository.findOne({
      where: { id: new ObjectId(productId) } as any,
      relations: ['regions'],
    });

    if (!product || !product.regions || product.regions.length === 0) {
      throw new NotFoundException('Product variant not found');
    }

    // Extract the specific price
    const region = product.regions[0];
    const color = region?.colors?.[0];
    const storage = color?.storages?.[0];
    const price = storage?.price;

    if (!price) {
      throw new NotFoundException('Price not found for this variant');
    }

    return {
      region: { id: region.id, name: region.regionName },
      color: { id: color.id, name: color.colorName, image: color.colorImage },
      storage: { id: storage.id, size: storage.storageSize },
      price: {
        regular: price.regularPrice,
        compare: price.comparePrice,
        discount: price.discountPrice,
        discountPercent: price.discountPercent,
        campaign: price.campaignPrice,
        campaignActive: this.isCampaignActive(price.campaignStart, price.campaignEnd),
        final: this.calculateFinalPrice(price),
      },
      stock: {
        quantity: price.stockQuantity,
        lowStockAlert: price.lowStockAlert,
        inStock: price.stockQuantity > 0,
        isLowStock: price.stockQuantity <= price.lowStockAlert,
      },
    };
  }

  /**
   * Update product
   */
  async update(id: string, dto: UpdateProductNewDto) {
    const product = await this.productRepository.findOne({ 
      where: { id: new ObjectId(id) } as any 
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // For simplicity, we'll update only the main product fields
    // Updating nested relations would require a similar transaction approach
    Object.assign(product, {
      name: dto.name ?? product.name,
      slug: dto.slug ?? product.slug,
      description: dto.description ?? product.description,
      categoryId: dto.categoryId ? new ObjectId(dto.categoryId) : product.categoryId,
      brandId: dto.brandId ? new ObjectId(dto.brandId) : product.brandId,
      productCode: dto.productCode ?? product.productCode,
      sku: dto.sku ?? product.sku,
      warranty: dto.warranty ?? product.warranty,
      isActive: dto.isActive ?? product.isActive,
      isOnline: dto.isOnline ?? product.isOnline,
      isPos: dto.isPos ?? product.isPos,
      isPreOrder: dto.isPreOrder ?? product.isPreOrder,
      isOfficial: dto.isOfficial ?? product.isOfficial,
      freeShipping: dto.freeShipping ?? product.freeShipping,
      rewardPoints: dto.rewardPoints ?? product.rewardPoints,
      minBookingPrice: dto.minBookingPrice ?? product.minBookingPrice,
      seoTitle: dto.seoTitle ?? product.seoTitle,
      seoDescription: dto.seoDescription ?? product.seoDescription,
      seoKeywords: dto.seoKeywords ?? product.seoKeywords,
      seoCanonical: dto.seoCanonical ?? product.seoCanonical,
      tags: dto.tags ?? product.tags,
      faqIds: dto.faqIds ? dto.faqIds.map(id => new ObjectId(id)) : product.faqIds,
    });

    await this.productRepository.save(product);

    return this.findOne(product.slug);
  }

  /**
   * Soft delete product
   */
  async remove(id: string) {
    const product = await this.productRepository.findOne({ 
      where: { id: new ObjectId(id) } as any 
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);

    return { success: true, message: 'Product deleted successfully' };
  }

  /**
   * Search products
   */
  async search(query: string) {
    return this.findAll({ search: query, limit: 20 });
  }

  // ============ Helper Methods ============

  private formatProductResponse(product: Product) {
    const prices = this.extractAllPrices(product);
    const totalStock = this.calculateTotalStock(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      productCode: product.productCode,
      sku: product.sku,
      warranty: product.warranty,
      // Simple product fields
      price: product.price,
      comparePrice: product.comparePrice,
      stockQuantity: product.stockQuantity,
      lowStockAlert: product.lowStockAlert,
      isActive: product.isActive,
      isOnline: product.isOnline,
      isPos: product.isPos,
      isPreOrder: product.isPreOrder,
      isOfficial: product.isOfficial,
      freeShipping: product.freeShipping,
      rewardPoints: product.rewardPoints,
      minBookingPrice: product.minBookingPrice,
      seo: {
        title: product.seoTitle,
        description: product.seoDescription,
        keywords: product.seoKeywords,
        canonical: product.seoCanonical,
      },
      tags: product.tags,
      faqIds: product.faqIds,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        currency: 'BDT',
      },
      totalStock,
      images: product.images?.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        isThumbnail: img.isThumbnail,
        altText: img.altText,
      })),
      videos: product.videos?.map((vid) => ({
        id: vid.id,
        url: vid.videoUrl,
        type: vid.videoType,
      })),
      directColors: product.directColors?.map((color) => ({
        id: color.id,
        name: color.colorName,
        image: color.colorImage,
        hasStorage: color.hasStorage,
        singlePrice: color.singlePrice,
        singleComparePrice: color.singleComparePrice,
        singleStockQuantity: color.singleStockQuantity,
        features: color.features,
        storages: color.hasStorage ? color.storages?.map((storage) => ({
          id: storage.id,
          size: storage.storageSize,
          price: {
            regular: storage.price?.regularPrice,
            compare: storage.price?.comparePrice,
            discount: storage.price?.discountPrice,
            discountPercent: storage.price?.discountPercent,
            campaign: storage.price?.campaignPrice,
            campaignActive: this.isCampaignActive(
              storage.price?.campaignStart,
              storage.price?.campaignEnd,
            ),
            final: this.calculateFinalPrice(storage.price),
          },
          stock: storage.price?.stockQuantity,
          inStock: (storage.price?.stockQuantity ?? 0) > 0,
        })) : undefined,
      })),
      regions: product.regions?.map((region) => ({
        id: region.id,
        name: region.regionName,
        isDefault: region.isDefault,
        colors: region.colors?.map((color) => ({
          id: color.id,
          name: color.colorName,
          image: color.colorImage,
          hasStorage: color.hasStorage,
          singlePrice: color.singlePrice,
          singleComparePrice: color.singleComparePrice,
          singleStockQuantity: color.singleStockQuantity,
          features: color.features,
          storages: color.hasStorage ? color.storages?.map((storage) => ({
            id: storage.id,
            size: storage.storageSize,
            price: {
              regular: storage.price?.regularPrice,
              compare: storage.price?.comparePrice,
              discount: storage.price?.discountPrice,
              discountPercent: storage.price?.discountPercent,
              campaign: storage.price?.campaignPrice,
              campaignActive: this.isCampaignActive(
                storage.price?.campaignStart,
                storage.price?.campaignEnd,
              ),
              final: this.calculateFinalPrice(storage.price),
            },
            stock: storage.price?.stockQuantity,
            inStock: (storage.price?.stockQuantity ?? 0) > 0,
          })) : undefined,
        })),
      })),
      specifications: this.groupSpecifications(product.specifications),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private extractAllPrices(product: Product): number[] {
    const prices: number[] = [];

    // Simple product price
    if (product.price) {
      prices.push(product.price);
    }

    // Direct colors prices
    product.directColors?.forEach((color) => {
      if (color.singlePrice) {
        prices.push(color.singlePrice);
      }
      if (color.hasStorage) {
        color.storages?.forEach((storage) => {
          if (storage.price) {
            const finalPrice = this.calculateFinalPrice(storage.price);
            prices.push(finalPrice);
          }
        });
      }
    });

    // Region-based prices
    product.regions?.forEach((region) => {
      region.colors?.forEach((color) => {
        if (color.singlePrice) {
          prices.push(color.singlePrice);
        }
        if (color.hasStorage) {
          color.storages?.forEach((storage) => {
            if (storage.price) {
              const finalPrice = this.calculateFinalPrice(storage.price);
              prices.push(finalPrice);
            }
          });
        }
      });
    });

    return prices.length > 0 ? prices : [0];
  }

  private calculateTotalStock(product: Product): number {
    let total = 0;

    // Simple product stock
    if (product.stockQuantity) {
      total += product.stockQuantity;
    }

    // Direct colors stock
    product.directColors?.forEach((color) => {
      if (color.singleStockQuantity) {
        total += color.singleStockQuantity;
      }
      if (color.hasStorage) {
        color.storages?.forEach((storage) => {
          total += storage.price?.stockQuantity ?? 0;
        });
      }
    });

    // Region-based stock
    product.regions?.forEach((region) => {
      region.colors?.forEach((color) => {
        if (color.singleStockQuantity) {
          total += color.singleStockQuantity;
        }
        if (color.hasStorage) {
          color.storages?.forEach((storage) => {
            total += storage.price?.stockQuantity ?? 0;
          });
        }
      });
    });

    return total;
  }

  private calculateFinalPrice(price: ProductPrice | undefined): number {
    if (!price) return 0;

    // Check if campaign is active
    if (
      price.campaignPrice &&
      this.isCampaignActive(price.campaignStart, price.campaignEnd)
    ) {
      return price.campaignPrice;
    }

    // Check discount price
    if (price.discountPrice) {
      return price.discountPrice;
    }

    // Return regular price
    return price.regularPrice;
  }

  private isCampaignActive(start?: Date, end?: Date): boolean {
    if (!start || !end) return false;

    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
  }

  private groupSpecifications(specs?: ProductSpecification[]) {
    if (!specs || specs.length === 0) return [];

    const grouped = new Map<string, any>();

    specs.forEach((spec) => {
      const groupName = spec.specGroup?.groupName;
      if (!groupName) return;

      if (!grouped.has(groupName)) {
        grouped.set(groupName, {
          group: groupName,
          icon: spec.specGroup?.icon,
          displayOrder: spec.specGroup?.displayOrder,
          specs: [],
        });
      }

      grouped.get(groupName).specs.push({
        key: spec.specKey,
        value: spec.specValue,
      });
    });

    return Array.from(grouped.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

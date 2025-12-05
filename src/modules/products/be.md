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
import {
  CreateProductColorDto,
  CreateProductNetworkDto,
  CreateProductRegionDto,
  CreateProductStorageDto,
} from './dto/create-product-new.dto';
import { UpdateProductNewDto } from './dto/update-product-new.dto';
import { Product } from './entities/product-new.entity';
import { ProductRegion } from './entities/product-region.entity';
import { ProductNetwork } from './entities/product-network.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductStorage } from './entities/product-storage.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVideo } from './entities/product-video.entity';
import { ProductSpecification } from './entities/product-specification.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a complete product with all variants, pricing, images, specs in a single transaction
   */
  async create(dto: CreateProductNewDto): Promise<any> {
    // Check if product with same slug already exists
    const existingProduct = await this.productRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingProduct) {
      throw new BadRequestException(`Product with slug "${dto.slug}" already exists`);
    }

    // Check for duplicate productCode
    if (dto.productCode) {
      const existingCode = await this.productRepository.findOne({
        where: { productCode: dto.productCode },
      });
      if (existingCode) {
        throw new BadRequestException(`Product code "${dto.productCode}" already exists`);
      }
    }

    // Check for duplicate SKU
    if (dto.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new BadRequestException(`SKU "${dto.sku}" already exists`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedProduct: Product | null = null;
    const directColors = this.sanitizeColorDtos(dto.directColors);
    const networks = this.sanitizeNetworkDtos(dto.networks);
    const regions = this.sanitizeRegionDtos(dto.regions);

    try {
      // 1. Create Product
      const product = queryRunner.manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId ? new ObjectId(dto.categoryId) : undefined,
        brandId: dto.brandId ? new ObjectId(dto.brandId) : undefined,
        productCode: dto.productCode,
        sku: dto.sku,
        warranty: dto.warranty,
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
        isEmi: dto.isEmi ?? false,
        rewardPoints: dto.rewardPoints ?? 0,
        minBookingPrice: dto.minBookingPrice ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
        seoCanonical: dto.seoCanonical,
        tags: dto.tags,
        faqIds: dto.faqIds ? dto.faqIds.map(id => new ObjectId(id)) : undefined,
      });

      savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Create Direct Colors (for products without regions)
      if (directColors.length > 0) {
        for (const colorDto of directColors) {
          const color = queryRunner.manager.create(ProductColor, {
            productId: new ObjectId(savedProduct.id),
            colorName: colorDto.colorName,
            colorImage: colorDto.colorImage,
            hasStorage: colorDto.hasStorage ?? false, // Default false for simple products
            singlePrice: colorDto.singlePrice,
            singleComparePrice: colorDto.singleComparePrice,
            singleDiscountPercent: colorDto.singleDiscountPercent,
            singleDiscountPrice: colorDto.singleDiscountPrice,
            singleStockQuantity: colorDto.singleStockQuantity,
            singleLowStockAlert: colorDto.singleLowStockAlert ?? 5,
            features: colorDto.features,
            displayOrder: colorDto.displayOrder ?? 0,
          });
          const savedColor = await queryRunner.manager.save(ProductColor, color);

          // Create storages if hasStorage = true
          if (colorDto.hasStorage && colorDto.storages && colorDto.storages.length > 0) {
            for (const storageDto of colorDto.storages) {
              const storage = queryRunner.manager.create(ProductStorage, {
                colorId: new ObjectId(savedColor.id),
                storageSize: storageDto.storageSize,
                displayOrder: storageDto.displayOrder ?? 0,
              });
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              // Create Price for this storage
              const price = new ProductPrice();
              price.storageId = new ObjectId(savedStorage.id);
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

      // 3. Create Networks → Colors → Storages (for network-based products like phones with carrier variants)
      if (networks.length > 0) {
        for (const networkDto of networks) {
          const network = queryRunner.manager.create(ProductNetwork, {
            productId: new ObjectId(savedProduct.id),
            networkType: networkDto.networkType,
            priceAdjustment: networkDto.priceAdjustment ?? 0,
            isDefault: networkDto.isDefault ?? false,
            displayOrder: networkDto.displayOrder ?? 0,
          });
          const savedNetwork = await queryRunner.manager.save(ProductNetwork, network);

          // Create colors within this network
          if (networkDto.colors && networkDto.colors.length > 0) {
            for (const colorDto of networkDto.colors) {
              const color = queryRunner.manager.create(ProductColor, {
                productId: new ObjectId(savedProduct.id),
                networkId: new ObjectId(savedNetwork.id),
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
                    colorId: new ObjectId(savedColor.id),
                    storageSize: storageDto.storageSize,
                    displayOrder: storageDto.displayOrder ?? 0,
                  });
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  // Create Price for this storage
                  const price = new ProductPrice();
                  price.storageId = new ObjectId(savedStorage.id);
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

      // 4. Create Regions → Default Storages + Colors (for region-based products)
      if (regions.length > 0) {
        for (const regionDto of regions) {
          const region = queryRunner.manager.create(ProductRegion, {
            productId: new ObjectId(savedProduct.id),
            regionName: regionDto.regionName,
            isDefault: regionDto.isDefault ?? false,
            displayOrder: regionDto.displayOrder ?? 0,
          });
          const savedRegion = await queryRunner.manager.save(ProductRegion, region);

          // 4a. Create default storages for this region (shared by all colors)
          if (regionDto.defaultStorages && regionDto.defaultStorages.length > 0) {
            for (const storageDto of regionDto.defaultStorages) {
              const storage = queryRunner.manager.create(ProductStorage, {
                regionId: new ObjectId(savedRegion.id),
                storageSize: storageDto.storageSize,
                displayOrder: storageDto.displayOrder ?? 0,
              });
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              // Create Price for this default storage
              const price = new ProductPrice();
              price.storageId = new ObjectId(savedStorage.id);
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

          // 4b. Create colors (which may use default storages or have custom storages)
          if (regionDto.colors && regionDto.colors.length > 0) {
            for (const colorDto of regionDto.colors) {
              const useDefaultStorages = colorDto.useDefaultStorages ?? true;
              
              const color = queryRunner.manager.create(ProductColor, {
                productId: new ObjectId(savedProduct.id),
                regionId: new ObjectId(savedRegion.id),
                colorName: colorDto.colorName,
                colorImage: colorDto.colorImage,
                hasStorage: colorDto.hasStorage ?? true,
                useDefaultStorages: useDefaultStorages,
                singlePrice: colorDto.singlePrice,
                singleComparePrice: colorDto.singleComparePrice,
                singleStockQuantity: colorDto.singleStockQuantity,
                features: colorDto.features,
                displayOrder: colorDto.displayOrder ?? 0,
              });
              const savedColor = await queryRunner.manager.save(ProductColor, color);

              // Create custom storages only if useDefaultStorages = false
              if (colorDto.hasStorage && !useDefaultStorages && colorDto.storages && colorDto.storages.length > 0) {
                for (const storageDto of colorDto.storages) {
                  const storage = queryRunner.manager.create(ProductStorage, {
                    colorId: new ObjectId(savedColor.id),
                    storageSize: storageDto.storageSize,
                    displayOrder: storageDto.displayOrder ?? 0,
                  });
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  // Create Price for this custom storage
                  const price = new ProductPrice();
                  price.storageId = new ObjectId(savedStorage.id);
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

      // 5. Create Images
      if (dto.images && dto.images.length > 0) {
        for (const imageDto of dto.images) {
          const image = queryRunner.manager.create(ProductImage, {
            productId: new ObjectId(savedProduct.id),
            imageUrl: imageDto.imageUrl,
            isThumbnail: imageDto.isThumbnail ?? false,
            altText: imageDto.altText,
            displayOrder: imageDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductImage, image);
        }
      }

      // 6. Create Videos
      if (dto.videos && dto.videos.length > 0) {
        for (const videoDto of dto.videos) {
          const video = queryRunner.manager.create(ProductVideo, {
            productId: new ObjectId(savedProduct.id),
            videoUrl: videoDto.videoUrl,
            videoType: videoDto.videoType,
            displayOrder: videoDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductVideo, video);
        }
      }

      // 7. Create Specifications
      if (dto.specifications && dto.specifications.length > 0) {
        for (const spec of dto.specifications) {
          const productSpec = queryRunner.manager.create(ProductSpecification, {
            productId: new ObjectId(savedProduct.id),
            specKey: spec.specKey,
            specValue: spec.specValue,
            displayOrder: spec.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductSpecification, productSpec);
        }
      }

      await queryRunner.commitTransaction();

      // Return complete product with all relations
      return this.findOne(savedProduct.slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Log the full error for debugging
      console.error('Product creation error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });

      // Manual cleanup for MongoDB (since transactions don't work properly without replica set)
      try {
        if (error.code === 11000 || error.message?.includes('duplicate key') || error.message?.includes('E11000')) {
          console.log('Attempting manual cleanup due to duplicate key error...');
          
          // Check if it's a null regionName error
          if (error.message?.includes('regionName: null')) {
            // Delete regions with null regionName for this product
            await this.dataSource.manager.delete('ProductRegion', { 
              productId: savedProduct?.id, 
              regionName: null as any 
            });
            console.log('Cleaned up regions with null regionName');
          }
          
          const duplicateField = this.extractDuplicateField(error);
          throw new BadRequestException(
            `${duplicateField} already exists. Please use a different value. Database has been cleaned up, please try again.`,
          );
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      
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
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      order: { createdAt: 'DESC' },
      relations: ['images', 'videos', 'specifications'],
    });

    if (products.length === 0) {
      return [];
    }

    // Load nested relations for each product
    const productsWithFullRelations = await Promise.all(
      products.map(async (product) => {
        // Load networks with colors and storages
        if (product.networks && product.networks.length > 0) {
          for (const network of product.networks) {
            const colors = await this.dataSource.getMongoRepository(ProductColor).find({
              where: { networkId: network.id } as any,
            });
            
            for (const color of colors) {
              const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
                where: { colorId: color.id } as any,
              });
              
              for (const storage of storages) {
                const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
                  where: { storageId: storage.id } as any,
                });
                (storage as any).price = price;
              }
              (color as any).storages = storages;
            }
            (network as any).colors = colors;
          }
        }

        // Load regions with defaultStorages and colors
        if (product.regions && product.regions.length > 0) {
          for (const region of product.regions) {
            const defaultStorages = await this.dataSource.getMongoRepository(ProductStorage).find({
              where: { regionId: region.id } as any,
            });
            
            for (const storage of defaultStorages) {
              const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
                where: { storageId: storage.id } as any,
              });
              (storage as any).price = price;
            }
            (region as any).defaultStorages = defaultStorages;

            const colors = await this.dataSource.getMongoRepository(ProductColor).find({
              where: { regionId: region.id } as any,
            });
            
            for (const color of colors) {
              const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
                where: { colorId: color.id } as any,
              });
              
              for (const storage of storages) {
                const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
                  where: { storageId: storage.id } as any,
                });
                (storage as any).price = price;
              }
              (color as any).storages = storages;
            }
            (region as any).colors = colors;
          }
        }

        // Load storages for directColors
        if (product.directColors && product.directColors.length > 0) {
          for (const color of product.directColors) {
            const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
              where: { colorId: color.id } as any,
            });
            
            for (const storage of storages) {
              const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
                where: { storageId: storage.id } as any,
              });
              (storage as any).price = price;
            }
            (color as any).storages = storages;
          }
        }

        return product;
      }),
    );

    return productsWithFullRelations.map((product) => this.formatProductResponse(product));
  }

  /**
   * Get single product by slug with all details
   */
  async findOne(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['images', 'videos', 'regions', 'networks', 'directColors', 'specifications'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Manually load nested relations for networks (colors with storages)
    if (product.networks && product.networks.length > 0) {
      for (const network of product.networks) {
        // Load colors for this network
        const colors = await this.dataSource.getMongoRepository(ProductColor).find({
          where: { networkId: network.id } as any,
        });
        
        for (const color of colors) {
          // Load storages for this color
          const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
            where: { colorId: color.id } as any,
          });
          
          // Load prices for storages
          for (const storage of storages) {
            const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
              where: { storageId: storage.id } as any,
            });
            (storage as any).price = price;
          }
          (color as any).storages = storages;
        }
        (network as any).colors = colors;
      }
    }

    // Manually load nested relations for regions (defaultStorages and colors with their storages)
    if (product.regions && product.regions.length > 0) {
      for (const region of product.regions) {
        // Load defaultStorages with prices
        const regionWithDefaults = await this.dataSource.getMongoRepository(ProductRegion).findOne({
          where: { _id: region.id } as any,
        });
        
        if (regionWithDefaults) {
          // Load default storages
          const defaultStorages = await this.dataSource.getMongoRepository(ProductStorage).find({
            where: { regionId: region.id } as any,
          });
          
          // Load prices for default storages
          for (const storage of defaultStorages) {
            const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
              where: { storageId: storage.id } as any,
            });
            (storage as any).price = price;
          }
          (region as any).defaultStorages = defaultStorages;

          // Load colors with their custom storages
          const colors = await this.dataSource.getMongoRepository(ProductColor).find({
            where: { regionId: region.id } as any,
          });
          
          for (const color of colors) {
            // Load custom storages for this color
            const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
              where: { colorId: color.id } as any,
            });
            
            // Load prices for custom storages
            for (const storage of storages) {
              const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
                where: { storageId: storage.id } as any,
              });
              (storage as any).price = price;
            }
            (color as any).storages = storages;
          }
          (region as any).colors = colors;
        }
      }
    }

    // Load storages for directColors
    if (product.directColors && product.directColors.length > 0) {
      for (const color of product.directColors) {
        const storages = await this.dataSource.getMongoRepository(ProductStorage).find({
          where: { colorId: color.id } as any,
        });
        
        for (const storage of storages) {
          const price = await this.dataSource.getMongoRepository(ProductPrice).findOne({
            where: { storageId: storage.id } as any,
          });
          (storage as any).price = price;
        }
        (color as any).storages = storages;
      }
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
      shortDescription: dto.shortDescription ?? product.shortDescription,
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
      isEmi: dto.isEmi ?? product.isEmi,
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
      isEmi: product.isEmi,
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
        singleDiscountPercent: color.singleDiscountPercent,
        singleDiscountPrice: color.singleDiscountPrice,
        singleStockQuantity: color.singleStockQuantity,
        singleLowStockAlert: color.singleLowStockAlert,
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
      networks: product.networks?.map((network: any) => ({
        id: network.id,
        name: network.networkType,
        priceAdjustment: network.priceAdjustment,
        isDefault: network.isDefault,
        colors: network.colors?.map((color: any) => ({
          id: color.id,
          name: color.colorName,
          image: color.colorImage,
          hasStorage: color.hasStorage,
          singlePrice: color.singlePrice,
          singleComparePrice: color.singleComparePrice,
          singleStockQuantity: color.singleStockQuantity,
          features: color.features,
          storages: color.hasStorage ? color.storages?.map((storage: any) => ({
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
      regions: product.regions?.map((region: any) => ({
        id: region.id,
        name: region.regionName,
        isDefault: region.isDefault,
        defaultStorages: region.defaultStorages?.map((storage: any) => ({
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
        })),
        colors: region.colors?.map((color: any) => ({
          id: color.id,
          name: color.colorName,
          image: color.colorImage,
          hasStorage: color.hasStorage,
          useDefaultStorages: color.useDefaultStorages,
          singlePrice: color.singlePrice,
          singleComparePrice: color.singleComparePrice,
          singleStockQuantity: color.singleStockQuantity,
          features: color.features,
          // Include custom storages only if useDefaultStorages = false
          customStorages: color.hasStorage && !color.useDefaultStorages ? color.storages?.map((storage: any) => ({
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

    // Network-based prices
    product.networks?.forEach((network) => {
      network.colors?.forEach((color) => {
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

    // Network-based stock
    product.networks?.forEach((network) => {
      network.colors?.forEach((color) => {
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

    // Return specs as simple array of key-value pairs, sorted by displayOrder
    return specs
      .map((spec) => ({
        key: spec.specKey,
        value: spec.specValue,
        displayOrder: spec.displayOrder,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private sanitizeStorageDtos(storages?: CreateProductStorageDto[]): CreateProductStorageDto[] {
    return (storages ?? [])
      .map((storage) => ({
        ...storage,
        storageSize: storage.storageSize?.trim() ?? '',
      }))
      .filter((storage) => Boolean(storage.storageSize));
  }

  private sanitizeColorDtos(colors?: CreateProductColorDto[]): CreateProductColorDto[] {
    return (colors ?? [])
      .map((color) => ({
        ...color,
        colorName: color.colorName?.trim() ?? '',
        storages: this.sanitizeStorageDtos(color.storages),
      }))
      .filter((color) => Boolean(color.colorName));
  }

  private sanitizeNetworkDtos(networks?: CreateProductNetworkDto[]): CreateProductNetworkDto[] {
    return (networks ?? [])
      .map((network) => ({
        ...network,
        networkType: network.networkType?.trim() ?? '',
        colors: this.sanitizeColorDtos(network.colors),
      }))
      .filter((network) => Boolean(network.networkType) && network.colors.length > 0);
  }

  private sanitizeRegionDtos(regions?: CreateProductRegionDto[]): CreateProductRegionDto[] {
    return (regions ?? [])
      .map((region) => ({
        ...region,
        regionName: region.regionName?.trim() ?? '',
        defaultStorages: this.sanitizeStorageDtos(region.defaultStorages),
        colors: this.sanitizeColorDtos(region.colors),
      }))
      .filter(
        (region) =>
          Boolean(region.regionName) &&
          (region.colors.length > 0 || region.defaultStorages.length > 0),
      );
  }

  private extractDuplicateField(error: any): string {
    const errorMessage = error.message || '';
    const errorString = JSON.stringify(error);
    
    console.log('Duplicate error details:', { errorMessage, errorString });
    
    // Check for slug duplicate
    if (errorMessage.includes('slug') || errorMessage.includes('UQ_') && errorMessage.includes('slug')) {
      return 'Product slug';
    }
    
    // Check for productCode duplicate
    if (errorMessage.includes('productCode')) {
      return 'Product code';
    }
    
    // Check for sku duplicate
    if (errorMessage.includes('sku')) {
      return 'SKU';
    }
    
    // Check for region name duplicate
    if (errorMessage.includes('regionName') || errorMessage.includes('productId_1_regionName')) {
      return 'Region name (duplicate region name for this product)';
    }
    
    // Check for color name duplicate
    if (errorMessage.includes('colorName')) {
      if (errorMessage.includes('productId')) {
        return 'Color name (duplicate color name for this product)';
      }
      if (errorMessage.includes('regionId')) {
        return 'Color name (duplicate color name for this region)';
      }
      return 'Color name';
    }
    
    // Check for storage size duplicate
    if (errorMessage.includes('storageSize') || errorMessage.includes('colorId_1_storageSize')) {
      return 'Storage size (duplicate storage size for this color)';
    }
    
    // Check for specification duplicate
    if (errorMessage.includes('specKey') || errorMessage.includes('productId_1_specKey')) {
      return 'Specification key (duplicate specification for this product)';
    }
    
    // Default message
    return 'Value';
  }
}

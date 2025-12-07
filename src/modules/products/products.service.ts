import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ObjectId } from 'mongodb';
import { CreateBasicProductDto, CreateNetworkProductDto, CreateRegionProductDto } from './dto/create-product-new.dto';
import { Product } from './entities/product-new.entity';
import { ProductRegion } from './entities/product-region.entity';
import { ProductNetwork } from './entities/product-network.entity';
import { ProductColor } from './entities/product-color.entity';
import { ProductStorage } from './entities/product-storage.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVideo } from './entities/product-video.entity';
import { ProductSpecification } from './entities/product-specification.entity';
import { Category } from '../categories/entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create Basic Product
   */
  async createBasicProduct(createProductDto: CreateBasicProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Product
      const product = new Product();
      Object.assign(product, createProductDto);
      product.productType = 'basic';

      // Handle multiple categories and brands
      if ((createProductDto as any).categoryIds) {
        product.categoryIds = (createProductDto as any).categoryIds.map((id: string) => new ObjectId(id));
      }
      if ((createProductDto as any).brandIds) {
        product.brandIds = (createProductDto as any).brandIds.map((id: string) => new ObjectId(id));
      }
      
      // Remove relations from product object to save them separately
      delete (product as any).colors;
      delete (product as any).images;
      delete (product as any).videos;
      delete (product as any).specifications;

      const savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Save Images
      if ((createProductDto as any).images) {
        const images = (createProductDto as any).images.map((img: any) => {
          const image = new ProductImage();
          image.productId = savedProduct.id;
          image.imageUrl = img.url;
          image.isThumbnail = img.isThumbnail;
          image.altText = img.altText;
          image.displayOrder = img.displayOrder;
          return image;
        });
        await queryRunner.manager.save(ProductImage, images);
      }

      // 3. Save Videos
      if ((createProductDto as any).videos) {
        const videos = (createProductDto as any).videos.map((vid: any) => {
          const video = new ProductVideo();
          video.productId = savedProduct.id;
          video.videoUrl = vid.videoUrl;
          video.videoType = vid.videoType;
          video.displayOrder = vid.displayOrder;
          return video;
        });
        await queryRunner.manager.save(ProductVideo, videos);
      }

      // 4. Save Specifications
      if ((createProductDto as any).specifications) {
        const specs = (createProductDto as any).specifications.map((s: any) => {
          const spec = new ProductSpecification();
          spec.productId = savedProduct.id;
          spec.specKey = s.specKey;
          spec.specValue = s.specValue;
          spec.displayOrder = s.displayOrder;
          return spec;
        });
        await queryRunner.manager.save(ProductSpecification, specs);
      }

      // 5. Save Direct Colors (Basic Product Variants)
      if ((createProductDto as any).colors) {
        for (const c of (createProductDto as any).colors) {
          const color = new ProductColor();
          color.productId = savedProduct.id;
          color.colorName = c.colorName;
          color.colorImage = c.colorImage;
          color.hasStorage = c.hasStorage ?? false;
          color.singlePrice = c.singlePrice;
          color.singleComparePrice = c.singleComparePrice;
          color.singleStockQuantity = c.singleStockQuantity;
          // Map new fields
          color.regularPrice = c.regularPrice ?? c.singlePrice;
          color.discountPrice = c.discountPrice ?? c.singleDiscountPrice;
          color.stockQuantity = c.stockQuantity ?? c.singleStockQuantity;
          
          color.displayOrder = c.displayOrder ?? 0;
          
          const savedColor = await queryRunner.manager.save(ProductColor, color);

          // Save Storages for this Color
          if (c.storages && c.storages.length > 0) {
            for (const s of c.storages) {
              const storage = new ProductStorage();
              storage.colorId = savedColor.id;
              storage.storageSize = s.storageSize;
              storage.displayOrder = s.displayOrder ?? 0;
              
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              // Save Price for this Storage
              const price = new ProductPrice();
              price.storageId = savedStorage.id;
              price.regularPrice = s.regularPrice ?? 0;
              price.comparePrice = s.comparePrice;
              price.discountPrice = s.discountPrice;
              price.discountPercent = s.discountPercent;
              price.stockQuantity = s.stockQuantity ?? 0;
              price.lowStockAlert = s.lowStockAlert ?? 0;
              
              await queryRunner.manager.save(ProductPrice, price);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.slug);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === 11000) {
        throw new BadRequestException(this.extractDuplicateField(err));
      }
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create Network Product
   */
  async createNetworkProduct(createProductDto: CreateNetworkProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Product
      const product = new Product();
      Object.assign(product, createProductDto);
      product.productType = 'network';

      // Handle multiple categories and brands
      if ((createProductDto as any).categoryIds) {
        product.categoryIds = (createProductDto as any).categoryIds.map((id: string) => new ObjectId(id));
      }
      if ((createProductDto as any).brandIds) {
        product.brandIds = (createProductDto as any).brandIds.map((id: string) => new ObjectId(id));
      }
      
      delete (product as any).networks;
      delete (product as any).images;
      delete (product as any).videos;
      delete (product as any).specifications;

      const savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Save Images, Videos, Specs (Same as Basic)
      if ((createProductDto as any).images) {
        const images = (createProductDto as any).images.map((img: any) => {
          const image = new ProductImage();
          image.productId = savedProduct.id;
          image.imageUrl = img.url;
          image.isThumbnail = img.isThumbnail;
          image.altText = img.altText;
          image.displayOrder = img.displayOrder;
          return image;
        });
        await queryRunner.manager.save(ProductImage, images);
      }

      if ((createProductDto as any).videos) {
        const videos = (createProductDto as any).videos.map((vid: any) => {
          const video = new ProductVideo();
          video.productId = savedProduct.id;
          video.videoUrl = vid.videoUrl;
          video.videoType = vid.videoType;
          video.displayOrder = vid.displayOrder;
          return video;
        });
        await queryRunner.manager.save(ProductVideo, videos);
      }

      if ((createProductDto as any).specifications) {
        const specs = (createProductDto as any).specifications.map((s: any) => {
          const spec = new ProductSpecification();
          spec.productId = savedProduct.id;
          spec.specKey = s.specKey;
          spec.specValue = s.specValue;
          spec.displayOrder = s.displayOrder;
          return spec;
        });
        await queryRunner.manager.save(ProductSpecification, specs);
      }

      // 3. Save Networks
      if (createProductDto.networks) {
        for (const n of createProductDto.networks) {
          const network = new ProductNetwork();
          network.productId = savedProduct.id;
          network.networkType = n.networkName || n.name; // Handle both naming conventions
          network.priceAdjustment = n.priceAdjustment;
          network.isDefault = n.isDefault ?? false;
          network.displayOrder = n.displayOrder ?? 0;

          const savedNetwork = await queryRunner.manager.save(ProductNetwork, network);

          // Save Default Storages for Network
          if (n.defaultStorages) {
            for (const ds of n.defaultStorages) {
              const storage = new ProductStorage();
              storage.networkId = savedNetwork.id; // Linked to network directly
              storage.storageSize = ds.storageSize;
              storage.displayOrder = ds.displayOrder ?? 0;
              
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              const price = new ProductPrice();
              price.storageId = savedStorage.id;
              price.regularPrice = ds.regularPrice ?? 0;
              price.comparePrice = ds.comparePrice;
              price.discountPrice = ds.discountPrice;
              price.discountPercent = (ds as any).discountPercent;
              price.stockQuantity = ds.stockQuantity ?? 0;
              price.lowStockAlert = ds.lowStockAlert ?? 0;
              
              await queryRunner.manager.save(ProductPrice, price);
            }
          }

          // Save Colors for Network
          if (n.colors) {
            for (const c of n.colors) {
              const color = new ProductColor();
              color.networkId = savedNetwork.id;
              color.colorName = c.colorName;
              color.colorImage = c.colorImage;
              color.hasStorage = (c as any).hasStorage ?? true;
              color.useDefaultStorages = (c as any).useDefaultStorages ?? true;
              color.singlePrice = c.regularPrice; // Map regularPrice to singlePrice if no storage
              color.singleComparePrice = c.comparePrice;
              color.singleStockQuantity = c.stockQuantity;
              // Map new fields
              color.regularPrice = c.regularPrice;
              color.discountPrice = c.discountPrice;
              color.stockQuantity = c.stockQuantity;
              
              color.displayOrder = c.displayOrder ?? 0;

              const savedColor = await queryRunner.manager.save(ProductColor, color);

              // Save Custom Storages if not using defaults
              if (c.storages && !color.useDefaultStorages) {
                for (const s of c.storages) {
                  const storage = new ProductStorage();
                  storage.colorId = savedColor.id;
                  storage.storageSize = s.storageSize;
                  storage.displayOrder = s.displayOrder ?? 0;
                  
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  const price = new ProductPrice();
                  price.storageId = savedStorage.id;
                  price.regularPrice = s.regularPrice ?? 0;
                  price.comparePrice = s.comparePrice;
                  price.discountPrice = s.discountPrice;
                  price.discountPercent = (s as any).discountPercent;
                  price.stockQuantity = s.stockQuantity ?? 0;
                  price.lowStockAlert = s.lowStockAlert ?? 0;
                  
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.slug);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === 11000) {
        throw new BadRequestException(this.extractDuplicateField(err));
      }
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create Region Product
   */
  async createRegionProduct(createProductDto: CreateRegionProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Product
      const product = new Product();
      Object.assign(product, createProductDto);
      product.productType = 'region';

      // Handle multiple categories and brands
      if ((createProductDto as any).categoryIds) {
        product.categoryIds = (createProductDto as any).categoryIds.map((id: string) => new ObjectId(id));
      }
      if ((createProductDto as any).brandIds) {
        product.brandIds = (createProductDto as any).brandIds.map((id: string) => new ObjectId(id));
      }
      
      delete (product as any).regions;
      delete (product as any).images;
      delete (product as any).videos;
      delete (product as any).specifications;

      const savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Save Images, Videos, Specs
      if ((createProductDto as any).images) {
        const images = (createProductDto as any).images.map((img: any) => {
          const image = new ProductImage();
          image.productId = savedProduct.id;
          image.imageUrl = img.url;
          image.isThumbnail = img.isThumbnail;
          image.altText = img.altText;
          image.displayOrder = img.displayOrder;
          return image;
        });
        await queryRunner.manager.save(ProductImage, images);
      }

      if ((createProductDto as any).videos) {
        const videos = (createProductDto as any).videos.map((vid: any) => {
          const video = new ProductVideo();
          video.productId = savedProduct.id;
          video.videoUrl = vid.videoUrl;
          video.videoType = vid.videoType;
          video.displayOrder = vid.displayOrder;
          return video;
        });
        await queryRunner.manager.save(ProductVideo, videos);
      }

      if ((createProductDto as any).specifications) {
        const specs = (createProductDto as any).specifications.map((s: any) => {
          const spec = new ProductSpecification();
          spec.productId = savedProduct.id;
          spec.specKey = s.specKey;
          spec.specValue = s.specValue;
          spec.displayOrder = s.displayOrder;
          return spec;
        });
        await queryRunner.manager.save(ProductSpecification, specs);
      }

      // 3. Save Regions
      if (createProductDto.regions) {
        for (const r of createProductDto.regions) {
          const region = new ProductRegion();
          region.productId = savedProduct.id;
          region.regionName = r.regionName || r.name;
          region.isDefault = r.isDefault ?? false;
          region.displayOrder = r.displayOrder ?? 0;

          const savedRegion = await queryRunner.manager.save(ProductRegion, region);

          // Save Default Storages for Region
          // Note: DTO might have defaultStorages as strings or objects depending on FE. 
          // Based on FE code: defaultStorages is array of objects with prices.
          if ((r as any).defaultStorages) {
            for (const ds of (r as any).defaultStorages) {
              const storage = new ProductStorage();
              storage.regionId = savedRegion.id;
              storage.storageSize = ds.storageSize;
              storage.displayOrder = ds.displayOrder ?? 0;
              
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              const price = new ProductPrice();
              price.storageId = savedStorage.id;
              price.regularPrice = ds.regularPrice ?? 0;
              price.comparePrice = ds.comparePrice;
              price.discountPrice = ds.discountPrice;
              price.discountPercent = ds.discountPercent;
              price.stockQuantity = ds.stockQuantity ?? 0;
              price.lowStockAlert = ds.lowStockAlert ?? 0;
              
              await queryRunner.manager.save(ProductPrice, price);
            }
          }

          // Save Colors for Region
          if ((r as any).colors) {
            for (const c of (r as any).colors) {
              const color = new ProductColor();
              color.regionId = savedRegion.id;
              color.colorName = c.colorName;
              color.colorImage = c.colorImage;
              color.hasStorage = c.hasStorage ?? true;
              color.useDefaultStorages = c.useDefaultStorages ?? true;
              color.singlePrice = c.singlePrice;
              color.singleComparePrice = c.singleComparePrice;
              color.singleStockQuantity = c.singleStockQuantity;
              // Map new fields
              color.regularPrice = c.regularPrice ?? c.singlePrice;
              color.discountPrice = c.discountPrice ?? c.singleDiscountPrice;
              color.stockQuantity = c.stockQuantity ?? c.singleStockQuantity;
              
              color.displayOrder = c.displayOrder ?? 0;

              const savedColor = await queryRunner.manager.save(ProductColor, color);

              // Save Custom Storages if not using defaults
              if (c.storages && !color.useDefaultStorages) {
                for (const s of c.storages) {
                  const storage = new ProductStorage();
                  storage.colorId = savedColor.id;
                  storage.storageSize = s.storageSize;
                  storage.displayOrder = s.displayOrder ?? 0;
                  
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  const price = new ProductPrice();
                  price.storageId = savedStorage.id;
                  price.regularPrice = s.regularPrice ?? 0;
                  price.comparePrice = s.comparePrice;
                  price.discountPrice = s.discountPrice;
                  price.discountPercent = s.discountPercent;
                  price.stockQuantity = s.stockQuantity ?? 0;
                  price.lowStockAlert = s.lowStockAlert ?? 0;
                  
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.slug);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === 11000) {
        throw new BadRequestException(this.extractDuplicateField(err));
      }
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  // async findAll(filters?: {
  //   categoryId?: string;
  //   brandId?: string;
  //   isActive?: boolean;
  //   isOnline?: boolean;
  //   minPrice?: number;
  //   maxPrice?: number;
  //   search?: string;
  //   limit?: number;
  //   offset?: number;
  //   productType?: string;
  // }) {
  //   const whereConditions: any = {};

  //   if (filters?.categoryId) {
  //     whereConditions.categoryId = new ObjectId(filters.categoryId);
  //   }
  //   if (filters?.brandId) {
  //     whereConditions.brandId = new ObjectId(filters.brandId);
  //   }
  //   if (filters?.isActive !== undefined) {
  //     whereConditions.isActive = filters.isActive;
  //   }
  //   if (filters?.isOnline !== undefined) {
  //     whereConditions.isOnline = filters.isOnline;
  //   }
  //   if (filters?.productType) {
  //     whereConditions.productType = filters.productType;
  //   }

  //   const products = await this.productRepository.find({
  //     where: whereConditions,
  //     take: filters?.limit || 50,
  //     skip: filters?.offset || 0,
  //     order: { createdAt: 'DESC' },
  //     relations: [
  //       'images',
  //       'videos',
  //       'specifications',
  //       'networks',
  //       'regions',
  //       'directColors',
  //     ],
  //   });

  //   if (products.length === 0) {
  //     return [];
  //   }

  //   // Load nested relations for each product
  //   const productsWithFullRelations = await Promise.all(
  //     products.map(async (product) => {
  //       await this.loadProductRelations(product);

  //       return product;
  //     }),
  //   );

  //   return productsWithFullRelations.map((product) =>
  //     this.formatProductResponse(product),
  //   );
  // }
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
  productType?: string;
  fields?: string;
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
  if (filters?.productType) {
    whereConditions.productType = filters.productType;
  }

  // FAST PATH: Lightweight response for list views (admin products page)
  if (filters?.fields) {
    const fieldsArray = filters.fields.split(',').map(f => f.trim());
    
    const products = await this.productRepository.find({
      where: whereConditions,
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
      order: { createdAt: 'DESC' },
    });

    const total = await this.productRepository.count({ where: whereConditions });

    // Manually load images for MongoDB
    const needsImages = fieldsArray.includes('images');
    if (needsImages && products.length > 0) {
      const productIds = products.map(p => new ObjectId(p.id));
      const allImages = await this.dataSource.getMongoRepository(ProductImage).find({
        where: { productId: { $in: productIds } } as any,
        order: { displayOrder: 'ASC' }
      });

      // Group images by productId
      const imagesByProduct = new Map<string, ProductImage[]>();
      allImages.forEach(img => {
        const key = img.productId.toString();
        if (!imagesByProduct.has(key)) {
          imagesByProduct.set(key, []);
        }
        imagesByProduct.get(key)!.push(img);
      });

      // Assign images to products
      products.forEach(product => {
        product.images = imagesByProduct.get(product.id.toString()) || [];
      });
    }

    const data = products.map(product => {
      const result: any = {};
      
      fieldsArray.forEach(field => {
        if (field === 'images') {
          result.images = product.images?.map(img => ({
            id: img.id,
            url: img.imageUrl,
            isThumbnail: img.isThumbnail,
            altText: img.altText,
          })) || [];
        } else if (product.hasOwnProperty(field)) {
          result[field] = (product as any)[field];
        }
      });
      
      return result;
    });

    return { 
      data, 
      total,
      page: Math.floor((filters?.offset || 0) / (filters?.limit || 20)) + 1,
      limit: filters?.limit || 20,
    };
  }

  // SLOW PATH: Full details with all nested relations (for detail pages)
  const products = await this.productRepository.find({
    where: whereConditions,
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    order: { createdAt: 'DESC' },
  });

  if (products.length === 0) {
    return { 
      data: [], 
      total: 0,
      page: 1,
      limit: filters?.limit || 50,
    };
  }

  // Manually load all nested relations for each product (ONLY for full detail requests)
  const productsWithFullRelations = await Promise.all(
    products.map(async (product) => {
      await this.loadProductRelations(product);
      return product;
    }),
  );

  const formatted = productsWithFullRelations.map((product) =>
    this.formatProductResponse(product),
  );

  const total = await this.productRepository.count({ where: whereConditions });
  
  return { 
    data: formatted, 
    total,
    page: Math.floor((filters?.offset || 0) / (filters?.limit || 50)) + 1,
    limit: filters?.limit || 50,
  };
}
  /**
   * Get product details by ID with optional region/network context
   */
  async findProductDetails(productId: string, regionId?: string, networkId?: string) {
    const product = await this.productRepository.findOne({
      where: { _id: new ObjectId(productId) } as any,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.loadProductRelations(product);

    return this.formatProductResponse(product);
  }

  /**
   * Get single product by slug with all details
   */
  async findOne(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.loadProductRelations(product);

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
      where: { _id: new ObjectId(productId) } as any,
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
        campaignActive: this.isCampaignActive(
          price.campaignStart,
          price.campaignEnd,
        ),
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
   * Soft delete product
   */
  async remove(id: string) {
    const product = await this.productRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
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

  private async loadProductRelations(product: Product) {
    const productId = product.id;

    // 1. Load Top-level Relations manually
    if (!product.networks || product.networks.length === 0) {
      product.networks = await this.dataSource.getMongoRepository(ProductNetwork).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }
    if (!product.regions || product.regions.length === 0) {
      product.regions = await this.dataSource.getMongoRepository(ProductRegion).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }
    if (!product.directColors || product.directColors.length === 0) {
      product.directColors = await this.dataSource.getMongoRepository(ProductColor).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }
    if (!product.images || product.images.length === 0) {
      product.images = await this.dataSource.getMongoRepository(ProductImage).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }
    if (!product.videos || product.videos.length === 0) {
      product.videos = await this.dataSource.getMongoRepository(ProductVideo).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }
    if (!product.specifications || product.specifications.length === 0) {
      product.specifications = await this.dataSource.getMongoRepository(ProductSpecification).find({
        where: { productId: new ObjectId(productId) } as any,
        order: { displayOrder: 'ASC' }
      });
    }

    // 2. Load nested relations for networks (colors with storages)
    if (product.networks && product.networks.length > 0) {
      for (const network of product.networks) {
        // Load default storages for network
        const defaultStorages = await this.dataSource
          .getMongoRepository(ProductStorage)
          .find({
            where: { networkId: network.id } as any,
            order: { displayOrder: 'ASC' }
          });

        for (const storage of defaultStorages) {
          const price = await this.dataSource
            .getMongoRepository(ProductPrice)
            .findOne({
              where: { storageId: storage.id } as any,
            });
          (storage as any).price = price;
        }
        (network as any).defaultStorages = defaultStorages;

        // Load colors for this network
        const colors = await this.dataSource
          .getMongoRepository(ProductColor)
          .find({
            where: { networkId: network.id } as any,
            order: { displayOrder: 'ASC' }
          });

        for (const color of colors) {
          // Load storages for this color
          const storages = await this.dataSource
            .getMongoRepository(ProductStorage)
            .find({
              where: { colorId: color.id } as any,
              order: { displayOrder: 'ASC' }
            });

          // Load prices for storages
          for (const storage of storages) {
            const price = await this.dataSource
              .getMongoRepository(ProductPrice)
              .findOne({
                where: { storageId: storage.id } as any,
              });
            (storage as any).price = price;
          }
          (color as any).storages = storages;
        }
        (network as any).colors = colors;
      }
    }

    // 3. Load nested relations for regions (defaultStorages and colors with their storages)
    if (product.regions && product.regions.length > 0) {
      for (const region of product.regions) {
        // Load default storages
        const defaultStorages = await this.dataSource
          .getMongoRepository(ProductStorage)
          .find({
            where: { regionId: region.id } as any,
            order: { displayOrder: 'ASC' }
          });

        // Load prices for default storages
        for (const storage of defaultStorages) {
          const price = await this.dataSource
            .getMongoRepository(ProductPrice)
            .findOne({
              where: { storageId: storage.id } as any,
            });
          (storage as any).price = price;
        }
        (region as any).defaultStorages = defaultStorages;

        // Load colors with their custom storages
        const colors = await this.dataSource
          .getMongoRepository(ProductColor)
          .find({
            where: { regionId: region.id } as any,
            order: { displayOrder: 'ASC' }
          });

        for (const color of colors) {
          // Load custom storages for this color
          const storages = await this.dataSource
            .getMongoRepository(ProductStorage)
            .find({
              where: { colorId: color.id } as any,
              order: { displayOrder: 'ASC' }
            });

          // Load prices for custom storages
          for (const storage of storages) {
            const price = await this.dataSource
              .getMongoRepository(ProductPrice)
              .findOne({
                where: { storageId: storage.id } as any,
              });
            (storage as any).price = price;
          }
          (color as any).storages = storages;
        }
        (region as any).colors = colors;
      }
    }

    // 4. Load storages for directColors
    if (product.directColors && product.directColors.length > 0) {
      for (const color of product.directColors) {
        const storages = await this.dataSource
          .getMongoRepository(ProductStorage)
          .find({
            where: { colorId: color.id } as any,
            order: { displayOrder: 'ASC' }
          });

        for (const storage of storages) {
          const price = await this.dataSource
            .getMongoRepository(ProductPrice)
            .findOne({
              where: { storageId: storage.id } as any,
            });
          (storage as any).price = price;
        }
        (color as any).storages = storages;
      }
    }

    // 5. Load Categories and Brands
    if (product.categoryIds && product.categoryIds.length > 0) {
      const categories = await this.dataSource
        .getMongoRepository(Category)
        .find({
          where: {
            _id: { $in: product.categoryIds }
          } as any
        });
      (product as any).categories = categories;
    }

    if (product.brandIds && product.brandIds.length > 0) {
      const brands = await this.dataSource
        .getMongoRepository(Brand)
        .find({
          where: {
            _id: { $in: product.brandIds }
          } as any
        });
      (product as any).brands = brands;
    }
  }

  private formatProductResponse(product: Product) {
    const prices = this.extractAllPrices(product);
    const totalStock = this.calculateTotalStock(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      productType: product.productType,
      description: product.description,
      categoryId: product.categoryId,
      categoryIds: product.categoryIds,
      categories: (product as any).categories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
      brandId: product.brandId,
      brandIds: product.brandIds,
      brands: (product as any).brands?.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
      })),
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
        // New fields
        regularPrice: color.regularPrice,
        discountPrice: color.discountPrice,
        stockQuantity: color.stockQuantity,
        
        features: color.features,
        storages: color.hasStorage
          ? color.storages?.map((storage) => ({
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
            }))
          : undefined,
      })),
      networks: product.networks?.map((network: any) => ({
        id: network.id,
        name: network.networkType,
        priceAdjustment: network.priceAdjustment,
        isDefault: network.isDefault,
        defaultStorages: network.defaultStorages?.map((storage: any) => ({
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
        colors: network.colors?.map((color: any) => ({
          id: color.id,
          name: color.colorName,
          image: color.colorImage,
          hasStorage: color.hasStorage,
          singlePrice: color.singlePrice,
          singleComparePrice: color.singleComparePrice,
          singleStockQuantity: color.singleStockQuantity,
          // New fields
          regularPrice: color.regularPrice,
          discountPrice: color.discountPrice,
          stockQuantity: color.stockQuantity,

          features: color.features,
          storages: color.hasStorage
            ? color.storages?.map((storage: any) => ({
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
              }))
            : undefined,
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
          // New fields
          regularPrice: color.regularPrice,
          discountPrice: color.discountPrice,
          stockQuantity: color.stockQuantity,

          features: color.features,
          // Include custom storages only if useDefaultStorages = false
          customStorages:
            color.hasStorage && !color.useDefaultStorages
              ? color.storages?.map((storage: any) => ({
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
                }))
              : undefined,
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




  

  private extractDuplicateField(error: any): string {
    const errorMessage = error.message || '';
    const errorString = JSON.stringify(error);

    console.log('Duplicate error details:', { errorMessage, errorString });

    // Check for slug duplicate
    if (
      errorMessage.includes('slug') ||
      (errorMessage.includes('UQ_') && errorMessage.includes('slug'))
    ) {
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
    if (
      errorMessage.includes('regionName') ||
      errorMessage.includes('productId_1_regionName')
    ) {
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
    if (errorMessage.includes('storageSize')) {
      if (errorMessage.includes('productId')) {
        return 'Storage size (duplicate storage size for this product)';
      }
      if (errorMessage.includes('regionId')) {
        return 'Storage size (duplicate storage size for this region)';
      }
      return 'Storage size';
    }

    return 'Duplicate value';
  }

  //find by id
  async findById(id: string) {
    try {
      console.log('Finding product by ID:', id);
      const objectId = new ObjectId(id);
      console.log('ObjectId created:', objectId);
      
      const product = await this.productRepository.findOne({
        where: { _id: objectId } as any,
      });
      
      console.log('Product found:', product ? 'Yes' : 'No');
      
      if (!product) {
        return null;
      }

      // Manually load all relations for MongoDB
      await this.loadProductRelations(product);
      
      return product;
    } catch (error) {
      // If ObjectId conversion fails, return null
      console.error('Error in findById:', error);
      return null;
    }
  }
}
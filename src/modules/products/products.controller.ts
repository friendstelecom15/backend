import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductNewDto } from './dto/create-product-new.dto';
import { UpdateProductNewDto } from './dto/update-product-new.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileFieldsUpload, UploadType } from '../../common/decorators/file-upload.decorator';
import { CloudflareService } from '../../config/cloudflare-video.service';
import { ProductService } from './products.service';

@ApiTags('Products (New Architecture)')
@Controller('products-new')
export class ProductsController {
  constructor(
    private readonly productsService: ProductService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'management')
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create complete product with variants, pricing, images, and specs',
    description:
      'Single API call to create product with all related data in a transaction',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @FileFieldsUpload(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'galleryImages', maxCount: 20 },
    ],
    undefined,
    UploadType.IMAGE,
  )
  async create(
    @Body() createProductDto: CreateProductNewDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {
    // Parse stringified JSON fields (when sent as multipart/form-data)
    if (typeof createProductDto.regions === 'string') {
      try {
        createProductDto.regions = JSON.parse(createProductDto.regions as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid regions format. Must be valid JSON.');
      }
    }
    if (typeof createProductDto.networks === 'string') {
      try {
        createProductDto.networks = JSON.parse(createProductDto.networks as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid networks format. Must be valid JSON.');
      }
    }
    if (typeof createProductDto.specifications === 'string') {
      try {
        createProductDto.specifications = JSON.parse(createProductDto.specifications as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid specifications format. Must be valid JSON.');
      }
    }
    if (typeof createProductDto.seoKeywords === 'string') {
      try {
        createProductDto.seoKeywords = JSON.parse(createProductDto.seoKeywords as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid seoKeywords format. Must be valid JSON array.');
      }
    }
    if (typeof createProductDto.directColors === 'string') {
      try {
        createProductDto.directColors = JSON.parse(createProductDto.directColors as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid directColors format. Must be valid JSON.');
      }
    }
    if (typeof createProductDto.videos === 'string') {
      try {
        createProductDto.videos = JSON.parse(createProductDto.videos as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid videos format. Must be valid JSON.');
      }
    }
    if (typeof createProductDto.tags === 'string') {
      try {
        createProductDto.tags = JSON.parse(createProductDto.tags as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid tags format. Must be valid JSON array.');
      }
    }
    if (typeof createProductDto.faqIds === 'string') {
      try {
        createProductDto.faqIds = JSON.parse(createProductDto.faqIds as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid faqIds format. Must be valid JSON array.');
      }
    }

    // Upload thumbnail image to Cloudflare
    if (files?.thumbnail?.length) {
      try {
        const thumbnailFile = files.thumbnail[0];
        const upload = await this.cloudflareService.uploadImage(
          thumbnailFile.buffer,
          thumbnailFile.originalname,
        );
        
        // Add thumbnail as the first image with isThumbnail flag
        createProductDto.images = [
          {
            imageUrl: upload.variants?.[0] || upload.id || '',
            isThumbnail: true,
            altText: thumbnailFile.originalname,
            displayOrder: 0,
          },
        ];
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Thumbnail upload failed: ${message}`,
        );
      }
    }

    // Upload gallery images to Cloudflare
    if (files?.galleryImages?.length) {
      try {
        const uploadedGalleryImages = await Promise.all(
          files.galleryImages.map(async (file, index) => {
            const upload = await this.cloudflareService.uploadImage(
              file.buffer,
              file.originalname,
            );
            return {
              imageUrl: upload.variants?.[0] || upload.id || '',
              isThumbnail: false,
              altText: file.originalname,
              displayOrder: index + 1, // Start from 1 since thumbnail is 0
            };
          }),
        );
        
        // Append gallery images to existing images array (after thumbnail)
        createProductDto.images = [
          ...(createProductDto.images || []),
          ...uploadedGalleryImages,
        ];
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Gallery image upload failed: ${message}`,
        );
      }
    }

    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isOnline', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of products',
  })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isOnline') isOnline?: boolean,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.productsService.findAll({
      categoryId,
      brandId,
      isActive,
      isOnline,
      minPrice,
      maxPrice,
      search,
      limit,
      offset,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name, description, or code' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug with full details' })
  @ApiResponse({
    status: 200,
    description: 'Product details with variants, pricing, images, and specs',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Get(':productId/variant-price')
  @ApiOperation({ summary: 'Get specific variant price' })
  @ApiQuery({ name: 'regionId', required: false, type: String })
  @ApiQuery({ name: 'colorId', required: false, type: String })
  @ApiQuery({ name: 'storageId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Variant price and stock information',
  })
  getVariantPrice(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('regionId') regionId?: string,
    @Query('colorId') colorId?: string,
    @Query('storageId') storageId?: string,
  ) {
    return this.productsService.getVariantPrice(
      productId,
      regionId,
      colorId,
      storageId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin/Management only)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @FileFieldsUpload(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'galleryImages', maxCount: 20 },
    ],
    undefined,
    UploadType.IMAGE,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductNewDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {
    // Parse stringified JSON fields (when sent as multipart/form-data)
    if (typeof updateProductDto.regions === 'string') {
      try {
        updateProductDto.regions = JSON.parse(updateProductDto.regions as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid regions format. Must be valid JSON.');
      }
    }
    if (typeof updateProductDto.networks === 'string') {
      try {
        updateProductDto.networks = JSON.parse(updateProductDto.networks as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid networks format. Must be valid JSON.');
      }
    }
    if (typeof updateProductDto.specifications === 'string') {
      try {
        updateProductDto.specifications = JSON.parse(updateProductDto.specifications as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid specifications format. Must be valid JSON.');
      }
    }
    if (typeof updateProductDto.seoKeywords === 'string') {
      try {
        updateProductDto.seoKeywords = JSON.parse(updateProductDto.seoKeywords as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid seoKeywords format. Must be valid JSON array.');
      }
    }
    if (typeof updateProductDto.directColors === 'string') {
      try {
        updateProductDto.directColors = JSON.parse(updateProductDto.directColors as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid directColors format. Must be valid JSON.');
      }
    }
    if (typeof updateProductDto.videos === 'string') {
      try {
        updateProductDto.videos = JSON.parse(updateProductDto.videos as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid videos format. Must be valid JSON.');
      }
    }
    if (typeof updateProductDto.tags === 'string') {
      try {
        updateProductDto.tags = JSON.parse(updateProductDto.tags as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid tags format. Must be valid JSON array.');
      }
    }
    if (typeof updateProductDto.faqIds === 'string') {
      try {
        updateProductDto.faqIds = JSON.parse(updateProductDto.faqIds as any);
      } catch (error) {
        throw new InternalServerErrorException('Invalid faqIds format. Must be valid JSON array.');
      }
    }

    // Upload thumbnail image to Cloudflare
    if (files?.thumbnail?.length) {
      try {
        const thumbnailFile = files.thumbnail[0];
        const upload = await this.cloudflareService.uploadImage(
          thumbnailFile.buffer,
          thumbnailFile.originalname,
        );
        
        // Add thumbnail as the first image with isThumbnail flag
        updateProductDto.images = [
          {
            imageUrl: upload.variants?.[0] || upload.id || '',
            isThumbnail: true,
            altText: thumbnailFile.originalname,
            displayOrder: 0,
          },
        ];
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Thumbnail upload failed: ${message}`,
        );
      }
    }

    // Upload gallery images to Cloudflare
    if (files?.galleryImages?.length) {
      try {
        const uploadedGalleryImages = await Promise.all(
          files.galleryImages.map(async (file, index) => {
            const upload = await this.cloudflareService.uploadImage(
              file.buffer,
              file.originalname,
            );
            return {
              imageUrl: upload.variants?.[0] || upload.id || '',
              isThumbnail: false,
              altText: file.originalname,
              displayOrder: index + 1, // Start from 1 since thumbnail is 0
            };
          }),
        );
        
        // Append gallery images to existing images array (after thumbnail)
        updateProductDto.images = [
          ...(updateProductDto.images || []),
          ...uploadedGalleryImages,
        ];
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new InternalServerErrorException(
          `Gallery image upload failed: ${message}`,
        );
      }
    }

    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}

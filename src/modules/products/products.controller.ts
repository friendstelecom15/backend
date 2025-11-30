import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductCare } from './entities/product.care.entity';
import { CareCreateDto } from './dto/care-create.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotifyProduct } from './entities/notifyproduct.entity';
import {
  FileFieldsUpload,
  UploadType,
} from '../../common/decorators/file-upload.decorator';
import { CloudflareService } from 'src/config/cloudflare-video.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  // NotifyProduct Endpoints

  @Post(':productId/notify')
  @ApiOperation({
    summary: 'Create notification request for a product (guest or user)',
  })
  createNotify(
    @Param('productId') productId: string,
    @Body() dto: Partial<NotifyProduct>,
  ) {
    return this.productsService.createNotify({ ...dto, productId });
  }

  @Get('cares')
  @ApiOperation({ summary: 'Get all care plans (with product/category names)' })
  async getAllCares() {
    const cares = await this.productsService.getCares();
    const productIds = cares.flatMap((c) => c.productIds || []);
    const categoryIds = cares.flatMap((c) => c.categoryIds || []);
    const uniqueProductIds = [...new Set(productIds)];
    const uniqueCategoryIds = [...new Set(categoryIds)];
    const products = uniqueProductIds.length
      ? await this.productsService['productRepository'].findByIds(
          uniqueProductIds,
        )
      : [];
    const categoryRepo =
      this.productsService['productRepository'].manager.getRepository(
        'Category',
      );
    const categories = uniqueCategoryIds.length
      ? await categoryRepo.findByIds(uniqueCategoryIds)
      : [];
    return cares.map((care) => ({
      ...care,
      productNames: (care.productIds || []).map(
        (pid) =>
          products.find(
            (p) =>
              p.id?.toString?.() === pid ||
              (p as any)._id?.toString?.() === pid,
          )?.name || pid,
      ),
      categoryNames: (care.categoryIds || []).map(
        (cid) =>
          categories.find(
            (cat) =>
              cat.id?.toString?.() === cid ||
              (cat as any)._id?.toString?.() === cid,
          )?.name || cid,
      ),
    }));
  }

  @Patch('notify/:id')
  @ApiOperation({ summary: 'Update notification request' })
  updateNotify(@Param('id') id: string, @Body() dto: Partial<NotifyProduct>) {
    return this.productsService.updateNotify(id, dto);
  }

  @Get(':productId/notify')
  @ApiOperation({ summary: 'Get all notification requests for a product' })
  getNotifies(@Param('productId') productId: string) {
    return this.productsService.getNotifies(productId);
  }

  @Get('notify/:id')
  @ApiOperation({ summary: 'Get notification request by id' })
  getNotifyById(@Param('id') id: string) {
    return this.productsService.getNotifyById(id);
  }

  @Delete('notify/:id')
  @ApiOperation({ summary: 'Delete notification request' })
  removeNotify(@Param('id') id: string) {
    return this.productsService.removeNotify(id);
  }

  // Product Care Endpoints

  @Post('cares')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create care plan (Admin/Management only)' })
  createCare(@Body() dto: CareCreateDto) {
    return this.productsService.createCare(dto);
  }

  @Patch('cares/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update care plan (Admin/Management only)' })
  updateCare(@Param('id') id: string, @Body() dto: Partial<ProductCare>) {
    return this.productsService.updateCare(id, dto);
  }

  @Get(':productId/cares')
  @ApiOperation({ summary: 'Get all care plans for a product' })
  getCares(@Param('productId') productId: string) {
    return this.productsService.getCares(productId);
  }

  @Get('cares/:id')
  @ApiOperation({ summary: 'Get care plan by id' })
  getCareById(@Param('id') id: string) {
    return this.productsService.getCareById(id);
  }

  @Delete('cares/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete care plan (Admin/Management only)' })
  removeCare(@Param('id') id: string) {
    return this.productsService.removeCare(id);
  }

  @Post()
  @FileFieldsUpload(
    [
      { name: 'gallery', maxCount: 10 },
      { name: 'image', maxCount: 1 }, // Add this line
    ],
    undefined,
    UploadType.IMAGE,
  )
  @ApiOperation({ summary: 'Create product (Admin/Management only)' })
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ) {
    // Upload images to Cloudflare and collect URLs
    const image: string[] = [];
    const gallery: string[] = [];
    if (files?.image?.length) {
      for (const file of files.image) {
        try {
          // You need to inject CloudflareService in this controller's constructor
          const upload = await this.cloudflareService.uploadImage(
            file.buffer,
            file.originalname,
          );
          image.push(
            upload.variants?.[0] || upload.id || upload.filename || '',
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          throw new InternalServerErrorException(
            `Cloudflare image upload failed: ${message}`,
          );
        }
      }
    }
    if (files?.gallery?.length) {
      for (const file of files.gallery) {
        try {
          const upload = await this.cloudflareService.uploadImage(
            file.buffer,
            file.originalname,
          );
          gallery.push(
            upload.variants?.[0] || upload.id || upload.filename || '',
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          throw new InternalServerErrorException(
            `Cloudflare gallery upload failed: ${message}`,
          );
        }
      }
    }
    return this.productsService.create({
      ...dto,
      image,
      gallery,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  findAll(
    @Query()
    filters: {
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
    },
  ) {
    return this.productsService.findAll(filters);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin/Management only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

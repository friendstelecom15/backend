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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (Admin/Management only)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
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

  @Get('new')
  @ApiOperation({ summary: 'Get new products' })
  getNew() {
    return this.productsService.getNew();
  }

  @Get('hot')
  @ApiOperation({ summary: 'Get hot products' })
  getHot() {
    return this.productsService.getHot();
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

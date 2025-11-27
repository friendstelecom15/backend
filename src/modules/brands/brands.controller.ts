import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create brand (Admin only)' })
  async create(@Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.create(dto);
    return {
      ...brand,
      id: brand.id,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  async findAll() {
    const brands = await this.brandsService.findAll();
    return brands.map(brand => ({
      ...brand,
      id: brand.id,
    }));
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured brands' })
  getFeatured() {
    return this.brandsService.getFeatured();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  async findOne(@Param('slug') slug: string) {
    const brand = await this.brandsService.findOne(slug);
    return {
      ...brand,
      id: brand.id,
    };
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get products by brand' })
  findProducts(@Param('slug') slug: string) {
    return this.brandsService.findProducts(slug);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const brand = await this.brandsService.update(id, dto);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return {
      ...brand,
      id: brand.id,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete brand (Admin only)' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}

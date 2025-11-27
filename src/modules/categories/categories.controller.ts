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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
} from './dto/category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (Admin only)' })
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    return {
      ...category,
      id: category.id,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map(category => ({
      ...category,
      id: category.id,
    }));
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured categories' })
  getFeatured() {
    return this.categoriesService.getFeatured();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findOne(@Param('slug') slug: string) {
    const category = await this.categoriesService.findOne(slug);
    return {
      ...category,
      id: category.id,
    };
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get products in category with filters' })
  findProducts(
    @Param('slug') slug: string,
    @Query() filters: CategoryFilterDto,
  ) {
    return this.categoriesService.findProducts(slug, filters);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, dto);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      ...category,
      id: category.id,
    };
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

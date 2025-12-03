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
import { ProductService } from './products.service';

@ApiTags('Products (New Architecture)')
@Controller('products-new')
export class ProductsController {
  constructor(private readonly productsService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
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
  create(@Body() createProductDto: CreateProductNewDto) {
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductNewDto,
  ) {
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

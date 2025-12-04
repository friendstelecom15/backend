import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== Price DTO ====================
export class CreateProductPriceDto {
  @ApiProperty({ description: 'Regular price', example: 1299.99 })
  @IsNumber()
  @Min(0)
  regularPrice: number;

  @ApiPropertyOptional({ description: 'Compare at price (MSRP)', example: 1399.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Discount price', example: 1249.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percentage', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Campaign price', example: 1199.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  campaignPrice?: number;

  @ApiPropertyOptional({ description: 'Campaign start date', example: '2025-12-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  campaignStart?: string;

  @ApiPropertyOptional({ description: 'Campaign end date', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  campaignEnd?: string;

  @ApiProperty({ description: 'Stock quantity', example: 50 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Low stock alert threshold', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  lowStockAlert?: number;
}

// ==================== Storage DTO ====================
export class CreateProductStorageDto {
  @ApiProperty({ description: 'Storage/Size variant', example: '256GB' })
  @IsString()
  @IsNotEmpty()
  storageSize: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ description: 'Price and stock for this storage variant', type: CreateProductPriceDto })
  @ValidateNested()
  @Type(() => CreateProductPriceDto)
  price: CreateProductPriceDto;
}

// ==================== Color DTO ====================
export class CreateProductColorDto {
  @ApiProperty({ description: 'Color name', example: 'Natural Titanium' })
  @IsString()
  @IsNotEmpty()
  colorName: string;

  @ApiPropertyOptional({ description: 'Color image URL', example: 'https://cdn.example.com/natural-titanium.jpg' })
  @IsOptional()
  @IsString()
  colorImage?: string;

  @ApiPropertyOptional({ description: 'Has storage variants?', example: true })
  @IsOptional()
  @IsBoolean()
  hasStorage?: boolean;

  @ApiPropertyOptional({ description: 'Price for color-only products (when hasStorage=false)', example: 2990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  singlePrice?: number;

  @ApiPropertyOptional({ description: 'Compare price for color-only products', example: 3990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  singleComparePrice?: number;

  @ApiPropertyOptional({ description: 'Stock quantity for color-only products', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  singleStockQuantity?: number;

  @ApiPropertyOptional({ description: 'Color-specific features', example: ['Wireless Charging', 'iPhone 17'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Storage variants for this color (when hasStorage=true)', type: [CreateProductStorageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductStorageDto)
  storages?: CreateProductStorageDto[];
}

// ==================== Region DTO ====================
export class CreateProductRegionDto {
  @ApiProperty({ description: 'Region/Variant name', example: 'International' })
  @IsString()
  @IsNotEmpty()
  regionName: string;

  @ApiPropertyOptional({ description: 'Is this the default region?', example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Color variants for this region', type: [CreateProductColorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  colors?: CreateProductColorDto[];
}

// ==================== Image DTO ====================
export class CreateProductImageDto {
  @ApiProperty({ description: 'Image URL', example: 'https://cdn.example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Is this the thumbnail?', example: true })
  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;

  @ApiPropertyOptional({ description: 'Alt text for SEO', example: 'iPhone 15 Pro Max Front' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

// ==================== Video DTO ====================
export class CreateProductVideoDto {
  @ApiProperty({ description: 'Video URL', example: 'https://youtube.com/watch?v=xxx' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiPropertyOptional({ description: 'Video type', example: 'youtube' })
  @IsOptional()
  @IsString()
  videoType?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

// ==================== Specification DTO ====================
export class CreateProductSpecDto {
  @ApiProperty({ description: 'Specification key', example: 'Screen Size' })
  @IsString()
  @IsNotEmpty()
  specKey: string;

  @ApiProperty({ description: 'Specification value', example: '6.7 inches' })
  @IsString()
  @IsNotEmpty()
  specValue: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class CreateProductSpecificationDto {
  @ApiProperty({ description: 'Specification group name', example: 'Display' })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Icon for this group', example: 'display-icon' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Specifications in this group', type: [CreateProductSpecDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecDto)
  specs: CreateProductSpecDto[];
}

// ==================== Main Product DTO ====================
export class CreateProductNewDto {
  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'iphone-15-pro-max' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Latest flagship phone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Category UUID', example: 'uuid-category' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Brand UUID', example: 'uuid-brand' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'IPHONE15PM' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'SKU', example: 'IPH-15-PM-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Warranty information', example: '1 Year Official Warranty' })
  @IsOptional()
  @IsString()
  warranty?: string;

  // Status Flags
  @ApiPropertyOptional({ description: 'Is product active?', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Visible online?', example: true })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ description: 'Visible in POS?', example: true })
  @IsOptional()
  @IsBoolean()
  isPos?: boolean;

  @ApiPropertyOptional({ description: 'Is pre-order?', example: false })
  @IsOptional()
  @IsBoolean()
  isPreOrder?: boolean;

  @ApiPropertyOptional({ description: 'Official product?', example: true })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiPropertyOptional({ description: 'Free shipping?', example: true })
  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  // Reward & Booking
  @ApiPropertyOptional({ description: 'Reward points', example: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardPoints?: number;

  @ApiPropertyOptional({ description: 'Minimum booking price for pre-order', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBookingPrice?: number;

  // SEO
  @ApiPropertyOptional({ description: 'SEO title', example: 'Buy iPhone 15 Pro Max - Best Price' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords', example: ['iphone', 'apple', 'flagship'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional()
  @IsString()
  seoCanonical?: string;

  @ApiPropertyOptional({ description: 'Product tags', example: ['flagship', 'premium'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Simple Product Fields (for products without variants)
  @ApiPropertyOptional({ description: 'Direct price (for simple products)', example: 2990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Direct compare price', example: 3990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Direct stock quantity', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Low stock alert', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  lowStockAlert?: number;

  // Nested Relations
  @ApiPropertyOptional({ description: 'Product regions with variants (for region-based products)', type: [CreateProductRegionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductRegionDto)
  regions?: CreateProductRegionDto[];

  @ApiPropertyOptional({ description: 'Direct color variants (for products without regions)', type: [CreateProductColorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  directColors?: CreateProductColorDto[];

  @ApiPropertyOptional({ description: 'Product images', type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ description: 'Product videos', type: [CreateProductVideoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVideoDto)
  videos?: CreateProductVideoDto[];

  @ApiPropertyOptional({ description: 'Product specifications', type: [CreateProductSpecificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSpecificationDto)
  specifications?: CreateProductSpecificationDto[];

  @ApiPropertyOptional({ description: 'FAQ IDs associated with this product', example: ['507f1f77bcf86cd799439011'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  faqIds?: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateProductDto {
  // Review/rating fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  averageRating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rewardsPoints?: number;

  // Additional pricing fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minBookingPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  purchasePoints?: number;

  // Media
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  video?: string;
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Status Flags
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isComing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPreOrder?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emiAvailable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  gallery?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  image?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  highlights?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  badges?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  seoKeywords?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  priceObj?: any;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  dynamicInputs?: any;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  details?: any;

  // Meta fields
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metaTitle?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  metaKeywords?: string[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  campaigns?: any;

  // Arrays of objects
  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsArray()
  variants?: { name: string; price: string; stock: string }[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsArray()
  regions?: { name: string; price: string; stock: string }[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsArray()
  colors?: { name: string; code: string }[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  networks?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  sizes?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  plugs?: string[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsArray()
  specifications?: { key: string; value: string }[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  faqIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum ProductType {
  GENERAL = 'GENERAL',
  MACBOOK = 'MACBOOK',
  LENDING = 'LENDING',
  OTHER = 'OTHER',
}

export class CreateProductDto {
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
  shortDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  longDescription?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  badges?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  gallery?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

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
  @IsString()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  seoKeywords?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  dynamicInputs?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  details?: any;
}

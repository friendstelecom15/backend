import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsNumber,
} from 'class-validator';

export class CreateFaqDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty({
    required: false,
    description: 'Order index for custom sorting',
  })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of product IDs this FAQ belongs to',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  productIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of category IDs this FAQ belongs to',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  categoryIds?: string[];
}

export class UpdateFaqDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    required: false,
    description: 'Order index for custom sorting',
  })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of product IDs this FAQ belongs to',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  productIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of category IDs this FAQ belongs to',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  categoryIds?: string[];
}

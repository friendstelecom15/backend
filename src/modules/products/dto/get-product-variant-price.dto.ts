import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GetProductVariantPriceDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: 'Region ID', example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Color ID', example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: 'Storage ID', example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  storageId?: string;
}

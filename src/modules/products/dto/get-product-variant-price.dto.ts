import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class GetProductVariantPriceDto {
  @ApiProperty({ description: 'Product ID', example: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Region ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Color ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  colorId?: string;

  @ApiPropertyOptional({ description: 'Storage ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  storageId?: string;
}

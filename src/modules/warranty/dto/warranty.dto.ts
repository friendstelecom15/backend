import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ActivateWarrantyDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  imei: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderId?: string;
}

export class WarrantyLookupDto {
  @ApiProperty()
  @IsString()
  imei: string;
}

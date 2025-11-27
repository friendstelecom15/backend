import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty()
  @IsString()
  productId: string;
}

export class AddToCompareDto {
  @ApiProperty()
  @IsString()
  productId: string;
}

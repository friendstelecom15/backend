import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productId?: string;
}

export class UpdateFaqDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  answer?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentBn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentEn?: string;
}

export class UpdatePolicyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentBn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentEn?: string;
}

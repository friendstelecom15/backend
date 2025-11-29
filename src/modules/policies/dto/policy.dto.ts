import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Type of policy (e.g., privacy, terms, refund)' })
  @IsString()
  type: string;

  @ApiProperty({ required: false, description: 'Order index for custom sorting', default: 0 })
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ required: false, description: 'Is the policy published?', default: false })
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ required: false, description: 'Policy content' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdatePolicyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'Type of policy (e.g., privacy, terms, refund)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, description: 'Order index for custom sorting' })
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ required: false, description: 'Is the policy published?' })
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ required: false, description: 'Policy content' })
  @IsOptional()
  @IsString()
  content?: string;
}

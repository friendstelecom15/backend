import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareCreateDto {
  @ApiPropertyOptional({ description: 'Single productId to assign care plan to (optional, for convenience)' })
  productId?: string;

  @ApiPropertyOptional({ description: 'Single categoryId to assign care plan to (optional, for convenience)' })
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Multiple product IDs (overrides productId if provided)' })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Multiple category IDs (overrides categoryId if provided)' })
  categoryIds?: string[];

  @ApiProperty({ description: 'Care plan name' })
  planName: string;

  @ApiProperty({ description: 'Care plan price' })
  price: number;

  @ApiProperty({ description: 'Duration (e.g., 2 years)' })
  duration: string;

  @ApiPropertyOptional({ description: 'Description of the care plan' })
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Features of the care plan' })
  features?: string[];
}

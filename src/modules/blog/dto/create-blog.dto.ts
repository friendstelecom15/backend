import { IsString, IsOptional, IsArray, IsDateString, IsInt, IsIn } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  author: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsInt()
  readTime?: number;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}


import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateHomeCategoryDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    priority?: number;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    categoryIds?: string[];

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    productIds?: string[];
}

export class UpdateHomeCategoryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    priority?: number;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    categoryIds?: string[];

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    productIds?: string[];
}

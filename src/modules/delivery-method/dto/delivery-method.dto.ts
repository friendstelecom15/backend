import { IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';

export class CreateDeliveryMethodDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  minDays: number;

  @IsInt()
  @Min(1)
  maxDays: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  extraFee?: number;
}

export class UpdateDeliveryMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  minDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraFee?: number;
}

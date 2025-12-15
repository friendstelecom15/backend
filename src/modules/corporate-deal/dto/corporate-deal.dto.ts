import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCorporateDealDto {
  @IsString()
  fullName: string;

  @IsString()
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  message?: string;
}

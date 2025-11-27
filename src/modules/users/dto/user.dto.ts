
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+8801234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;


  @ApiProperty({ example: 'strongPassword', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: ['user'], required: false, default: ['user'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[] = ['user'];

  @ApiProperty({ example: 'user', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'roleId123', required: false })
  @IsOptional()
  @IsString()
  roleId?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }

export class UserResponseDto {
  @ApiProperty({ example: '64a7f3b2e1c2a3d4f5a6b7c8' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  image?: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '+8801234567890', required: false })
  phone?: string;

  @ApiProperty({ example: ['user'] })
  roles: string[];

  @ApiProperty({ example: '2025-11-23T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-23T00:00:00.000Z' })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LeadDto {
  @ApiProperty({
    description: 'Email address of the lead',
    example: 'lead@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the lead',
    example: '+8801234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

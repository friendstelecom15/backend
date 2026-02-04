import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PurchaseDto {
  @ApiProperty({
    description: 'Email address of the purchaser',
    example: 'purchase@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the purchaser',
    example: '+8801234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Amount of the purchase',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Order ID of the purchase',
    example: 'ORD123456',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

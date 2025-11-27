import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class RedeemPointsDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  points: number;
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { RedeemPointsDto } from './dto/loyalty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) { }

  @Get(':userId/points')
  @ApiOperation({ summary: 'Get user loyalty points' })
  async getPoints(@Param('userId') userId: string) {
    return await this.loyaltyService.getPoints(userId);
  }

  @Post(':userId/redeem')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  async redeemPoints(@Param('userId') userId: string, @Body() dto: RedeemPointsDto) {
    return await this.loyaltyService.redeemPoints(userId, dto.points);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review (Authenticated users)' })
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    const review = await this.reviewsService.create(user.id, dto);
    return {
      ...review,
      id: review.id?.toString?.() ?? String(review.id),
    };
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get reviews by product' })
  async findByProduct(@Param('productId') productId: string) {
    const reviews = await this.reviewsService.findByProduct(productId);
    return reviews.map(review => ({
      ...review,
      id: review.id?.toString?.() ?? String(review.id),
    }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (Admin only)' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

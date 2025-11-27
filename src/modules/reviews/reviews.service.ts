
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/review.dto';
import { Review } from './entities/review.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ReviewsService {

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) { }


  async create(userId: string, dto: CreateReviewDto) {
    const review = this.reviewRepository.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment,
    });
    const saved = await this.reviewRepository.save(review);
    // await this.updateProductRating(dto.productId); // Product rating update logic should be handled in ProductService
    return saved;
  }


  async findByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }


  async remove(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const review = await this.reviewRepository.findOne({ where: { id: _id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewRepository.delete(_id);
    // await this.updateProductRating(review.productId); // Product rating update logic should be handled in ProductService
    return { success: true };
  }

  // Product rating update logic should be handled in ProductService if needed
}

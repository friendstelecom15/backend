import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyPoints } from './entities/loyaltypoints.entity';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyPoints)
    private readonly loyaltyRepo: Repository<LoyaltyPoints>,
  ) { }

  private calculateLevel(points: number): string {
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
  }

  async getPoints(userId: string) {
    let record = await this.loyaltyRepo.findOne({ where: { userId } });
    if (!record) {
      record = this.loyaltyRepo.create({ userId, points: 0, level: 'Bronze' });
      await this.loyaltyRepo.save(record);
    }
    return {
      userId: record.userId,
      points: record.points,
      level: record.level,
    };
  }

  async redeemPoints(userId: string, points: number) {
    if (points < 1) throw new BadRequestException('Points must be at least 1');
    const record = await this.loyaltyRepo.findOne({ where: { userId } });
    if (!record || record.points < points) {
      throw new BadRequestException('Not enough points');
    }
    record.points -= points;
    record.level = this.calculateLevel(record.points);
    await this.loyaltyRepo.save(record);
    return {
      userId: record.userId,
      pointsRedeemed: points,
      remainingPoints: record.points,
      level: record.level,
    };
  }
}

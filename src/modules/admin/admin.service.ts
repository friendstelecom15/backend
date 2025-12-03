
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product-new.entity';
@Injectable()
export class AdminService {

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }


  async getDashboardStats() {
    const [totalOrders, totalUsers, totalProducts, recentOrders, deliveredOrders] = await Promise.all([
      this.orderRepository.count(),
      this.userRepository.count(),
      this.productRepository.count(),
      this.orderRepository.find({
        take: 10,
        order: { createdAt: 'DESC' },
      }),
      this.orderRepository.find({ where: { status: 'delivered' } }),
    ]);
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      recentOrders,
    };
  }


  async getAnalytics() {
    // 'reviewsCount' is not a property in Product entity. Use another property or remove ordering.
    const topSellingProducts = await this.productRepository.find({
      take: 10,
      order: { createdAt: 'DESC' },
    });
    return {
      topSellingProducts,
    };
  }

  async getStockAlerts() {
    return [];
  }
}

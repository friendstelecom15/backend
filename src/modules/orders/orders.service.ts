import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  EMICalculationDto,
} from './dto/order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderitem.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const order = this.orderRepository.create({
      customer: dto.customer,
      total: dto.total,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
    });
    const savedOrder = await this.orderRepository.save(order);

    if (dto.orderItems && dto.orderItems.length > 0) {
      const items = dto.orderItems.map(item =>
        this.orderItemRepository.create({ ...item, orderId: String(savedOrder.id) })
      );
      const savedItems = await this.orderItemRepository.save(items as any[]);
      savedOrder.orderItems = savedItems;
    } else {
      savedOrder.orderItems = [];
    }
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.orderRepository.find({ order: { createdAt: 'DESC' } });
    await Promise.all(
      orders.map(async order => {
        order.orderItems = await this.orderItemRepository.find({ where: { orderId: String(order.id) } });
      })
    );
    return orders;
  }

  async findOne(id: string | ObjectId): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const order = await this.orderRepository.findOne({ where: { id: _id } });
    if (!order) throw new NotFoundException('Order not found');
    order.orderItems = await this.orderItemRepository.find({ where: { orderId: String(order.id) } });
    return order;
  }

  async updateStatus(id: string | ObjectId, dto: UpdateOrderStatusDto): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await this.orderRepository.update(_id, { status: dto.status });
    return this.findOne(_id);
  }

  calculateEMI(dto: EMICalculationDto) {
    const interestRate = 0.12;
    const monthlyRate = interestRate / 12;
    const monthlyPayment =
      (dto.amount * monthlyRate * Math.pow(1 + monthlyRate, dto.months)) /
      (Math.pow(1 + monthlyRate, dto.months) - 1);
    return {
      amount: dto.amount,
      months: dto.months,
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(monthlyPayment * dto.months),
      interestTotal: Math.round(monthlyPayment * dto.months - dto.amount),
    };
  }

  async generateInvoice(id: string | ObjectId) {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const order = await this.findOne(_id);
    return {
      ...order,
      invoiceNumber: 'INV-' + order.orderNumber,
      generatedAt: new Date(),
    };
  }
}
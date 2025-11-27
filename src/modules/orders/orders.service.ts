
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

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) { }

  async create(dto: CreateOrderDto) {
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
      const items = dto.orderItems.map(item => this.orderItemRepository.create({ ...item, orderId: savedOrder.id }));
      // ensure we pass a flat array to TypeORM save (guard against nested arrays)
      const itemsToSave = Array.isArray(items[0]) ? (items as any).flat() : items;
      const savedItems = await this.orderItemRepository.save(itemsToSave);
      savedOrder.orderItems = savedItems;
    }
    return savedOrder;
  }

  async findAll() {
    const orders = await this.orderRepository.find({ order: { createdAt: 'DESC' } });
    for (const order of orders) {
      order.orderItems = await this.orderItemRepository.find({ where: { orderId: order.id } });
    }
    return orders;
  }


  async findOne(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.orderItems = await this.orderItemRepository.find({ where: { orderId: order.id } });
    return order;
  }


  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.orderRepository.update(id, { status: dto.status });
    return this.findOne(id);
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

  async generateInvoice(id: string) {
    const order = await this.findOne(id);
    return {
      ...order,
      invoiceNumber: 'INV-' + order.orderNumber,
      generatedAt: new Date(),
    };
  }
}

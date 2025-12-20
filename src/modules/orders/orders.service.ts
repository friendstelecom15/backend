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

import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { WarrantyService } from '../warranty/warranty.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly notificationService: NotificationService,
    private readonly warrantyService: WarrantyService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNumber =
      'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Order create
    const order = this.orderRepository.create({
      customer: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        division: dto.division,
        district: dto.district,
        upzila: dto.upzila,
        postCode: dto.postCode,
        address: dto.address,
        paymentMethod: dto.paymentMethod,
        deliveryMethod: dto.deliveryMethod,
      },
      total: dto.total,
      orderNumber,
      status: 'order placed',
      paymentStatus: 'pending',
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      division: dto.division,
      district: dto.district,
      upzila: dto.upzila,
      postCode: dto.postCode,
      address: dto.address,
      paymentMethod: dto.paymentMethod,
      deliveryMethod: dto.deliveryMethod,
      statusHistory: [{ status: 'pending', date: new Date() }],
      totalRewardPoints: dto.totalRewardPoints || 0,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Order Items create with ALL data from frontend
    if (dto.orderItems && dto.orderItems.length > 0) {
      const items = dto.orderItems.map((item) => {
        // Create order item with ALL properties from frontend
        return this.orderItemRepository.create({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          colorName: item.colorName, // Store color name
          storage: item.storage,
          storageName: item.storageName, // Store storage name
          region: item.region,
          regionName: item.regionName, // Store region name
          priceType: item.priceType, // Store price type
          image: item.image,
          imei: item.imei,
          serial: item.serial,
          dynamicInputs: item.dynamicInputs || {},
          selectedVariants: item.selectedVariants || {}, // Store complete variant info
          orderId: String(savedOrder.id),
        });
      });

      await this.orderItemRepository.save(items);
    }

    // Load saved order items
    savedOrder.orderItems = await this.orderItemRepository.find({
      where: { orderId: String(savedOrder.id) },
    });

    // Decrement stock for each order item
    try {
      const productPriceRepo =
        this.orderRepository.manager.getRepository('ProductPrice');
      const productColorRepo =
        this.orderRepository.manager.getRepository('ProductColor');
      const productRepo = this.orderRepository.manager.getRepository('Product');
      const { ObjectId } = require('mongodb');
      for (const item of savedOrder.orderItems) {
        if (item.storage) {
          // Query ProductPrice by storageId, not id
          let storageId = item.storage;
          if (typeof storageId === 'string' && storageId.length === 24) {
            try {
              storageId = new ObjectId(storageId);
            } catch (e) {}
          }

          const price = await productPriceRepo.findOne({
            where: { storageId },
          });
          if (price && price.stockQuantity != null) {
            price.stockQuantity = Math.max(
              0,
              price.stockQuantity - item.quantity,
            );
            await productPriceRepo.save(price);
          } else {
          }
        } else if (item.color) {
          // Find ProductColor by region/network/productId+colorName if present, else by id
          let colorQuery: any = {};
          let color: any = null;
          if (item.region) {
            let regionId = item.region;
            if (typeof regionId === 'string' && regionId.length === 24) {
              try {
                regionId = new ObjectId(regionId);
              } catch (e) {}
            }
            colorQuery = { regionId, colorName: item.colorName };

            color = await productColorRepo.findOne({ where: colorQuery });
            if (!color) {
              // Try fallback: productId + colorName
              let productId = item.productId;
              if (typeof productId === 'string' && productId.length === 24) {
                try {
                  productId = new ObjectId(productId);
                } catch (e) {}
              }
              const fallbackQuery = { productId, colorName: item.colorName };

              color = await productColorRepo.findOne({ where: fallbackQuery });
            }
          } else if (item.network) {
            let networkId = item.network;
            if (typeof networkId === 'string' && networkId.length === 24) {
              try {
                networkId = new ObjectId(networkId);
              } catch (e) {}
            }
            colorQuery = { networkId, colorName: item.colorName };

            color = await productColorRepo.findOne({ where: colorQuery });
            if (!color) {
              // Try fallback: productId + colorName
              let productId = item.productId;
              if (typeof productId === 'string' && productId.length === 24) {
                try {
                  productId = new ObjectId(productId);
                } catch (e) {}
              }
              const fallbackQuery = { productId, colorName: item.colorName };

              color = await productColorRepo.findOne({ where: fallbackQuery });
            }
          } else if (item.productId && item.colorName) {
            let productId = item.productId;
            if (typeof productId === 'string' && productId.length === 24) {
              try {
                productId = new ObjectId(productId);
              } catch (e) {}
            }
            colorQuery = { productId, colorName: item.colorName };

            color = await productColorRepo.findOne({ where: colorQuery });
          } else {
            let colorId = item.color;
            if (typeof colorId === 'string' && colorId.length === 24) {
              try {
                colorId = new ObjectId(colorId);
              } catch (e) {}
            }
            colorQuery = { id: colorId };

            color = await productColorRepo.findOne({ where: colorQuery });
          }
          if (color && color.singleStockQuantity != null) {
            color.singleStockQuantity = Math.max(
              0,
              color.singleStockQuantity - item.quantity,
            );
            await productColorRepo.save(color);
          } else if (color && color.stockQuantity != null) {
            // Fallback: decrement stockQuantity if singleStockQuantity is null

            color.stockQuantity = Math.max(
              0,
              color.stockQuantity - item.quantity,
            );
            await productColorRepo.save(color);
          } else {
            // If no ProductColor found, try to decrement main Product stock (for basic products)
            let productId = item.productId;
            if (typeof productId === 'string' && productId.length === 24) {
              try {
                productId = new ObjectId(productId);
              } catch (e) {
                console.log('Invalid ObjectId for product:', item.productId);
              }
            }

            const product = await productRepo.findOne({
              where: { id: productId },
            });
            if (product && product.stockQuantity != null) {
              product.stockQuantity = Math.max(
                0,
                product.stockQuantity - item.quantity,
              );
              await productRepo.save(product);
            } else {
            }
          }
        } else {
          // If neither storage nor color, try to decrement main Product stock
          let productId = item.productId;
          if (typeof productId === 'string' && productId.length === 24) {
            try {
              productId = new ObjectId(productId);
            } catch (e) {
              console.log('Invalid ObjectId for product:', item.productId);
            }
          }

          const product = await productRepo.findOne({
            where: { id: productId },
          });
          if (product && product.stockQuantity != null) {
            product.stockQuantity = Math.max(
              0,
              product.stockQuantity - item.quantity,
            );
            await productRepo.save(product);
          } else {
          }
        }
      }
    } catch (e) {}

    // Create notification for new order (user)
    try {
      // User notification
      await this.notificationService.create({
        userId: savedOrder.customer?.email,
        type: NotificationType.ORDER_UPDATE,
        title: 'Order Placed',
        message: `Your order ${savedOrder.orderNumber} has been placed successfully!`,
        link: `/account/orders/${savedOrder.id}`,
        status: 'pending',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // Admin notification (no userId field)
      await this.notificationService.create({
        type: NotificationType.ADMIN_ORDER_PLACED,
        title: 'New Order Placed',
        message: `A new order (${savedOrder.orderNumber}) has been placed by ${savedOrder.customer?.fullName || 'a customer'}.`,
        link: `/admin/orders`,
        status: 'pending',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: true,
      });
    } catch (e) {
      // Optionally log notification error
    }
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
    await Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepository.find({
          where: { orderId: String(order.id) },
        });
        // Only pick important fields for admin
        order.orderItems = items.map((item) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName,
          storageName: item.storageName,
          regionName: item.regionName,
          priceType: item.priceType,
          image: item.image,
        }));
      }),
    );
    return orders;
  }

  async findOne(id: string | ObjectId): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    let order = await this.orderRepository.findOne({ where: { id: _id } });
    if (!order) {
      order = await this.orderRepository.findOne({
        where: { _id: _id },
      } as any);
    }
    if (!order) throw new NotFoundException('Order not found');
    const items = await this.orderItemRepository.find({
      where: { orderId: String(order.id) },
    });
    order.orderItems = items.map((item) => ({
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      colorName: item.colorName,
      storageName: item.storageName,
      regionName: item.regionName,
      priceType: item.priceType,
      image: item.image,
    }));
    return order;
  }

  //order get by user id
  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { customer: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    await Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepository.find({
          where: { orderId: String(order.id) },
        });
        // Only pick important fields for user
        order.orderItems = items.map((item) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName,
          storageName: item.storageName,
          regionName: item.regionName,
          priceType: item.priceType,
          image: item.image,
        }));
      }),
    );
    return orders;
  }

  async getOrderTracking(id: string) {
    // Now fetch by orderNumber instead of id/_id
    const order = await this.orderRepository.findOne({
      where: { orderNumber: id },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Helper to get date from statusHistory
    const getStatusDate = (status: string) => {
      if (!Array.isArray(order.statusHistory)) return null;
      const entry = order.statusHistory.find((s: any) => s.status === status);
      return entry ? entry.date : null;
    };

    const timeline = [
      {
        label: 'Order Placed',
        date: order.createdAt,
        completed: true,
      },
      {
        label: 'Order Confirmed',
        date: getStatusDate('confirmed'),
        completed: [
          'confirmed',
          'processing',
          'preparing-to-ship',
          'shipped',
          'out-for-delivery',
          'delivered',
        ].includes(order.status),
      },
      {
        label: 'Processing',
        date: getStatusDate('processing'),
        completed: [
          'processing',
          'preparing-to-ship',
          'shipped',
          'out-for-delivery',
          'delivered',
        ].includes(order.status),
      },
      {
        label: 'Preparing to Ship',
        date: getStatusDate('preparing-to-ship'),
        completed: [
          'preparing-to-ship',
          'shipped',
          'out-for-delivery',
          'delivered',
        ].includes(order.status),
      },
      {
        label: 'Shipped',
        date: getStatusDate('shipped'),
        completed: ['shipped', 'out-for-delivery', 'delivered'].includes(
          order.status,
        ),
      },
      {
        label: 'Out for Delivery',
        date: getStatusDate('out-for-delivery'),
        completed: ['out-for-delivery', 'delivered'].includes(order.status),
      },
      {
        label: 'Delivered',
        date: getStatusDate('delivered'),
        completed: order.status === 'delivered',
      },
    ];

    // Shipping address
    const shippingAddress = {
      fullName: order.fullName,
      address: order.address,
      division: order.division,
      district: order.district,
      upzila: order.upzila,
      postCode: order.postCode,
      phone: order.phone,
      email: order.email,
    };

    // Payment summary (expand as needed)
    const paymentSummary = {
      subtotal: order.total, // You can split subtotal, tax, discount if you store them
      shipping: order.deliveryMethod === 'free' ? 'FREE' : order.deliveryMethod,
      tax: 0, // Add tax if you store it
      discount: 0, // Add discount if you store it
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    };

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      timeline,
      shippingAddress,
      paymentSummary,
    };
  }

  async updateStatus(
    id: string | ObjectId,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    console.log('updateStatus called with _id:', _id);
    // Always try _id first for MongoDB compatibility
    let order = await this.orderRepository.findOne({
      where: { _id: _id },
    } as any);
    console.log('Order found by _id:', order);
    if (!order) {
      order = await this.orderRepository.findOne({ where: { id: _id } });
      console.log('Order found by id:', order);
    }
    if (!order) throw new NotFoundException('Order not found');
    // Update status and push to statusHistory
    const newStatusEntry = { status: dto.status, date: new Date() };
    const updatedHistory = Array.isArray(order.statusHistory)
      ? [...order.statusHistory, newStatusEntry]
      : [newStatusEntry];

    // Payment status logic
    let paymentStatus = order.paymentStatus;
    if (dto.status === 'returned') {
      paymentStatus = 'refunded'; // Returned order, payment refunded
    } else if (dto.status === 'cancelled') {
      paymentStatus = 'void'; // Cancelled order, payment voided
    } else if (dto.status === 'delivered') {
      paymentStatus = 'completed';
    }

    // Always update using _id as primary key for MongoDB
    await this.orderRepository.update(_id, {
      status: dto.status,
      statusHistory: updatedHistory,
      paymentStatus,
    });

    // অর্ডার delivered হলে অটো ওয়ারেন্টি এন্ট্রি এবং reward points যোগ
    if (dto.status === 'delivered') {
      // একাধিক অর্ডার আইটেম থাকলে প্রত্যেকটির জন্য ওয়ারেন্টি এন্ট্রি
      // Always use _id for MongoDB
      const updatedOrder = await this.orderRepository.findOne({ where: { _id: _id } } as any);
      console.log('[Warranty] updatedOrder:', updatedOrder);
      if (!updatedOrder || !updatedOrder.id) {
        console.error('[Warranty] Cannot process warranty: updatedOrder or updatedOrder.id missing. _id:', _id, 'updatedOrder:', updatedOrder);
        // Return the original order object after update
        return order;
      } else {
        console.log('[Warranty] updatedOrder.id:', updatedOrder.id, 'typeof:', typeof updatedOrder.id);
        const orderIdStr = String(updatedOrder.id);
        const fullOrderItems = await this.orderItemRepository.find({ where: { orderId: orderIdStr } });
        for (const item of fullOrderItems || []) {
          try {
            // Prefer direct fields, fallback to dynamicInputs
            const dynamicInputs = item.dynamicInputs && typeof item.dynamicInputs === 'object' ? item.dynamicInputs : {};
            const imei = item.imei || dynamicInputs.imei || '';
            const serial = item.serial || dynamicInputs.serial || '';
            console.log('[Warranty] Creating for productId:', item.productId, 'IMEI:', imei, 'Serial:', serial, 'OrderId:', orderIdStr);
            if (!item.productId) {
              console.warn('[Warranty] Skipping: productId missing for item:', item);
              continue;
            }
            if (!imei && !serial) {
              console.warn('[Warranty] Skipping: Both IMEI and Serial missing for item:', item);
              continue;
            }
            await this.warrantyService.activate(
              {
                productId: item.productId,
                imei,
                serial,
                phone: updatedOrder.phone ?? '',
                orderId: orderIdStr,
              },
              'system',
            );
            console.log('[Warranty] Created successfully for productId:', item.productId);
          } catch (e) {
            console.error('[Warranty] Error creating for productId:', item.productId, e);
          }
        }
        // Reward points যোগ করা
        try {
          // User repository lazily loaded to avoid circular dependency
          const userRepo = this.orderRepository.manager.getRepository('User');
          // Find user by email (from order)
          const user = await userRepo.findOne({ where: { email: updatedOrder.email } });
          if (user) {
            const currentPoints = user.myrewardPoints || 0;
            const orderPoints = updatedOrder.totalRewardPoints || 0;
            user.myrewardPoints = currentPoints + orderPoints;
            await userRepo.save(user);
            console.log('[RewardPoints] Added', orderPoints, 'to user', user.email, 'Total now:', user.myrewardPoints);
          } else {
            console.warn('[RewardPoints] No user found for email:', updatedOrder.email);
          }
        } catch (e) {
          console.error('[RewardPoints] Error updating user points:', e);
        }
        return this.findOne(_id);
      }
    }
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

  async generateInvoice(orderNumber: string) {
    // Find order by orderNumber
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order,
      invoiceNumber: 'INV-' + order.orderNumber,
      generatedAt: new Date(),
    };
  }

  async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    // Find orders where the email field matches
    const orders = await this.orderRepository.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
    await Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepository.find({
          where: { orderId: String(order.id) },
        });
        order.orderItems = items.map((item) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName,
          storageName: item.storageName,
          regionName: item.regionName,
          priceType: item.priceType,
          image: item.image,
        }));
      }),
    );
    return orders;
  }
}

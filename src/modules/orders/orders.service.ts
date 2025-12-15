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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    private readonly notificationService: NotificationService,
  ) {}

async create(dto: CreateOrderDto): Promise<Order> {
  const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  
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
    status: 'pending',
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
    statusHistory: [
      { status: 'pending', date: new Date() }
    ],
  });
  
  const savedOrder = await this.orderRepository.save(order);

  // Order Items create with ALL data from frontend
  if (dto.orderItems && dto.orderItems.length > 0) {
    const items = dto.orderItems.map(item => {
      // Create order item with ALL properties from frontend
      return this.orderItemRepository.create({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        colorName: item.colorName,  // Store color name
        storage: item.storage,
        storageName: item.storageName,  // Store storage name
        region: item.region,
        regionName: item.regionName,  // Store region name
        priceType: item.priceType,  // Store price type
        image: item.image,
        dynamicInputs: item.dynamicInputs || {},
        selectedVariants: item.selectedVariants || {}, // Store complete variant info
        orderId: String(savedOrder.id)
      });
    });
    
    await this.orderItemRepository.save(items);
  }
  
  // Load saved order items
  savedOrder.orderItems = await this.orderItemRepository.find({ 
    where: { orderId: String(savedOrder.id) } 
  });
  
  // Decrement stock for each order item
  try {
    const productPriceRepo = this.orderRepository.manager.getRepository('ProductPrice');
    const productColorRepo = this.orderRepository.manager.getRepository('ProductColor');
    const productRepo = this.orderRepository.manager.getRepository('Product');
    const { ObjectId } = require('mongodb');
    for (const item of savedOrder.orderItems) {
      if (item.storage) {
        // Query ProductPrice by storageId, not id
        let storageId = item.storage;
        if (typeof storageId === 'string' && storageId.length === 24) {
          try { storageId = new ObjectId(storageId); } catch (e) { console.log('Invalid ObjectId for storage:', item.storage); }
        }
        console.log('Looking for ProductPrice with storageId:', storageId, 'type:', typeof storageId);
        const price = await productPriceRepo.findOne({ where: { storageId } });
        if (price && price.stockQuantity != null) {
          console.log(`Before: ProductPrice ${price.id} (storageId: ${item.storage}) stockQuantity = ${price.stockQuantity}, decrement by ${item.quantity}`);
          price.stockQuantity = Math.max(0, price.stockQuantity - item.quantity);
          await productPriceRepo.save(price);
          console.log(`After: ProductPrice ${price.id} stockQuantity = ${price.stockQuantity}`);
        } else {
          console.log(`No ProductPrice found for storageId: ${item.storage}`);
        }
      } else if (item.color) {
        // Find ProductColor by region/network/productId+colorName if present, else by id
        let colorQuery: any = {};
        let color: any = null;
        if (item.region) {
          let regionId = item.region;
          if (typeof regionId === 'string' && regionId.length === 24) {
            try { regionId = new ObjectId(regionId); } catch (e) { console.log('Invalid ObjectId for region:', item.region); }
          }
          colorQuery = { regionId, colorName: item.colorName };
          console.log('Looking for ProductColor with regionId and colorName:', regionId, item.colorName);
          color = await productColorRepo.findOne({ where: colorQuery });
          if (!color) {
            // Try fallback: productId + colorName
            let productId = item.productId;
            if (typeof productId === 'string' && productId.length === 24) {
              try { productId = new ObjectId(productId); } catch (e) { console.log('Invalid ObjectId for product:', item.productId); }
            }
            const fallbackQuery = { productId, colorName: item.colorName };
            console.log('Fallback: Looking for ProductColor with productId and colorName:', productId, item.colorName);
            color = await productColorRepo.findOne({ where: fallbackQuery });
          }
        } else if (item.network) {
          let networkId = item.network;
          if (typeof networkId === 'string' && networkId.length === 24) {
            try { networkId = new ObjectId(networkId); } catch (e) { console.log('Invalid ObjectId for network:', item.network); }
          }
          colorQuery = { networkId, colorName: item.colorName };
          console.log('Looking for ProductColor with networkId and colorName:', networkId, item.colorName);
          color = await productColorRepo.findOne({ where: colorQuery });
          if (!color) {
            // Try fallback: productId + colorName
            let productId = item.productId;
            if (typeof productId === 'string' && productId.length === 24) {
              try { productId = new ObjectId(productId); } catch (e) { console.log('Invalid ObjectId for product:', item.productId); }
            }
            const fallbackQuery = { productId, colorName: item.colorName };
            console.log('Fallback: Looking for ProductColor with productId and colorName:', productId, item.colorName);
            color = await productColorRepo.findOne({ where: fallbackQuery });
          }
        } else if (item.productId && item.colorName) {
          let productId = item.productId;
          if (typeof productId === 'string' && productId.length === 24) {
            try { productId = new ObjectId(productId); } catch (e) { console.log('Invalid ObjectId for product:', item.productId); }
          }
          colorQuery = { productId, colorName: item.colorName };
          console.log('Looking for ProductColor with productId and colorName:', productId, item.colorName);
          color = await productColorRepo.findOne({ where: colorQuery });
        } else {
          let colorId = item.color;
          if (typeof colorId === 'string' && colorId.length === 24) {
            try { colorId = new ObjectId(colorId); } catch (e) { console.log('Invalid ObjectId for color:', item.color); }
          }
          colorQuery = { id: colorId };
          console.log('Looking for ProductColor with id:', colorId, 'type:', typeof colorId);
          color = await productColorRepo.findOne({ where: colorQuery });
        }
        if (color && color.singleStockQuantity != null) {
          console.log(`Before: ProductColor ${color.id} (colorName: ${color.colorName}) singleStockQuantity = ${color.singleStockQuantity}, decrement by ${item.quantity}`);
          color.singleStockQuantity = Math.max(0, color.singleStockQuantity - item.quantity);
          await productColorRepo.save(color);
          console.log(`After: ProductColor ${color.id} singleStockQuantity = ${color.singleStockQuantity}`);
        } else if (color && color.stockQuantity != null) {
          // Fallback: decrement stockQuantity if singleStockQuantity is null
          console.log(`Before: ProductColor ${color.id} (colorName: ${color.colorName}) stockQuantity = ${color.stockQuantity}, decrement by ${item.quantity}`);
          color.stockQuantity = Math.max(0, color.stockQuantity - item.quantity);
          await productColorRepo.save(color);
          console.log(`After: ProductColor ${color.id} stockQuantity = ${color.stockQuantity}`);
        } else {
          // If no ProductColor found, try to decrement main Product stock (for basic products)
          let productId = item.productId;
          if (typeof productId === 'string' && productId.length === 24) {
            try { productId = new ObjectId(productId); } catch (e) { console.log('Invalid ObjectId for product:', item.productId); }
          }
          console.log(`No ProductColor found for`, colorQuery, '. Trying to decrement Product stock for productId:', productId);
          const product = await productRepo.findOne({ where: { id: productId } });
          if (product && product.stockQuantity != null) {
            console.log(`Before: Product ${product.id} stockQuantity = ${product.stockQuantity}, decrement by ${item.quantity}`);
            product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
            await productRepo.save(product);
            console.log(`After: Product ${product.id} stockQuantity = ${product.stockQuantity}`);
          } else {
            console.log(`No Product found for id: ${item.productId}`);
          }
        }
      } else {
        // If neither storage nor color, try to decrement main Product stock
        let productId = item.productId;
        if (typeof productId === 'string' && productId.length === 24) {
          try { productId = new ObjectId(productId); } catch (e) { console.log('Invalid ObjectId for product:', item.productId); }
        }
        console.log(`Order item ${item.id} has neither storage nor color for stock decrement. Trying to decrement Product stock for productId:`, productId);
        const product = await productRepo.findOne({ where: { id: productId } });
        if (product && product.stockQuantity != null) {
          console.log(`Before: Product ${product.id} stockQuantity = ${product.stockQuantity}, decrement by ${item.quantity}`);
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          await productRepo.save(product);
          console.log(`After: Product ${product.id} stockQuantity = ${product.stockQuantity}`);
        } else {
          console.log(`No Product found for id: ${item.productId}`);
        }
      }
    }
  } catch (e) {
    console.log('Stock update error:', e);
  }

  // Create notification for new order (user)
  try {
    // User notification
    await this.notificationService.create({
      userId: savedOrder.customer?.id,
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
      link: `/admin/orders/${savedOrder.id}`,
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
    const orders = await this.orderRepository.find({ order: { createdAt: 'DESC' } });
    await Promise.all(
      orders.map(async order => {
        const items = await this.orderItemRepository.find({ where: { orderId: String(order.id) } });
        // Only pick important fields for admin
        order.orderItems = items.map(item => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName,
          storageName: item.storageName,
          regionName: item.regionName,
          priceType: item.priceType,
          image: item.image,
        }));
      })
    );
    return orders;
  }

  async findOne(id: string | ObjectId): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const order = await this.orderRepository.findOne({ where: { id: _id } });
    if (!order) throw new NotFoundException('Order not found');
    const items = await this.orderItemRepository.find({ where: { orderId: String(order.id) } });
    order.orderItems = items.map(item => ({
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
    const orders = await this.orderRepository.find({ where: { customer: { id: userId } }, order: { createdAt: 'DESC' } });
    await Promise.all(
      orders.map(async order => {
        const items = await this.orderItemRepository.find({ where: { orderId: String(order.id) } });
        // Only pick important fields for user
        order.orderItems = items.map(item => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          colorName: item.colorName,
          storageName: item.storageName,
          regionName: item.regionName,
          priceType: item.priceType,
          image: item.image,
        }));
      })
    );
    return orders;
  }

  //get order tracking info by order number
   // Get order tracking info by order number
  async getOrderTracking(id: string) {
    // Only treat as ObjectId if valid 24-char hex string
    let _id: ObjectId;
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      _id = new ObjectId(id);
    } else {
      throw new NotFoundException('Order not found');
    }
    // Try both 'id' and '_id' fields for compatibility
    let order = await this.orderRepository.findOne({ where: { id: _id } });
    if (!order) {
      order = await this.orderRepository.findOne({ where: { _id: _id } } as any);
    }
    if (!order) throw new NotFoundException('Order not found');

    // Timeline events (example, you can expand with more status/timestamps if you store them)
    // For now, we use createdAt for placed, and status for current state
    const timeline = [
      {
        label: 'Order Placed',
        date: order.createdAt,
        completed: true,
      },
      {
        label: 'Order Confirmed',
        date: ['confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'].includes(order.status) ? order.createdAt : null,
        completed: ['confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered'].includes(order.status),
      },
      {
        label: 'Shipped',
        date: ['shipped', 'out-for-delivery', 'delivered'].includes(order.status) ? order.createdAt : null,
        completed: ['shipped', 'out-for-delivery', 'delivered'].includes(order.status),
      },
      {
        label: 'Out for Delivery',
        date: ['out-for-delivery', 'delivered'].includes(order.status) ? order.createdAt : null,
        completed: ['out-for-delivery', 'delivered'].includes(order.status),
      },
      {
        label: 'Delivered',
        date: order.status === 'delivered' ? order.createdAt : null,
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

  async updateStatus(id: string | ObjectId, dto: UpdateOrderStatusDto): Promise<Order> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    // Fetch the order first
    const order = await this.orderRepository.findOne({ where: { id: _id } });
    if (!order) throw new NotFoundException('Order not found');
    // Update status and push to statusHistory
    const newStatusEntry = { status: dto.status, date: new Date() };
    const updatedHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory, newStatusEntry] : [newStatusEntry];
    await this.orderRepository.update(_id, { status: dto.status, statusHistory: updatedHistory });
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
    const order = await this.orderRepository.findOne({ where: { orderNumber } });
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order,
      invoiceNumber: 'INV-' + order.orderNumber,
      generatedAt: new Date(),
    };
  }
}
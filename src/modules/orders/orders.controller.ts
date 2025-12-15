import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  EMICalculationDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (Admin/Management)' })
  async findAll() {
    const orders = await this.ordersService.findAll();
    return orders.map((order) => ({
      ...order,
      id: order.id?.toString?.() ?? String(order.id),
      orderItems:
        order.orderItems?.map((item) => ({
          ...item,
          id: item.id?.toString?.() ?? String(item.id),
        })) ?? [],
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return {
      ...order,
      id: order.id?.toString?.() ?? String(order.id),
      orderItems:
        order.orderItems?.map((item) => ({
          ...item,
          id: item.id?.toString?.() ?? String(item.id),
        })) ?? [],
    };
  }

  @Get('tracking/:orderNumber')
  @ApiOperation({ summary: 'Get order tracking info by order number (User)' })
  async getOrderTracking(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderTracking(orderNumber);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin/Management)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate invoice for order' })
  generateInvoice(@Param('id') id: string) {
    return this.ordersService.generateInvoice(id);
  }

  @Post('calculate-emi')
  @ApiOperation({ summary: 'Calculate EMI for amount' })
  calculateEMI(@Body() dto: EMICalculationDto) {
    return this.ordersService.calculateEMI(dto);
  }
}

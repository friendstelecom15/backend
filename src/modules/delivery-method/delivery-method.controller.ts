import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DeliveryMethodService } from './delivery-method.service';
import { CreateDeliveryMethodDto, UpdateDeliveryMethodDto } from './dto/delivery-method.dto';

@Controller('delivery-methods')
export class DeliveryMethodController {
  constructor(private readonly service: DeliveryMethodService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDeliveryMethodDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryMethodDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

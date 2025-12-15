import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CorporateDealService } from './corporate-deal.service';
import { CreateCorporateDealDto } from './dto/corporate-deal.dto';

@Controller('corporate-deals')
export class CorporateDealController {
  constructor(private readonly service: CorporateDealService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCorporateDealDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

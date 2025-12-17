import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { FlashsellService } from './flashsell.service';
import { Flashsell } from './flashsell.entity';

@Controller('flashsell')
export class FlashsellController {
  constructor(private readonly flashsellService: FlashsellService) {}

  @Post()
  async create(@Body() data: Partial<Flashsell>) {
    return await this.flashsellService.create(data);
  }

  @Get()
  async findAll() {
    return await this.flashsellService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.flashsellService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Flashsell>) {
    return await this.flashsellService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.flashsellService.remove(id);
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { EmiService } from './emi.service';

@Controller('emi')
export class EmiController {
  constructor(private readonly emiService: EmiService) {}

  // EMI endpoints
  @Post('plan')
  createEmi(@Body() dto: any) {
    return this.emiService.createEmi(dto);
  }

  @Patch('plan/:id')
  updateEmi(@Param('id') id: string, @Body() dto: any) {
    return this.emiService.updateEmi(id, dto);
  }

  @Get('plans')
  getAllEmis() {
    return this.emiService.getAllEmis();
  }

  @Get('plan/:id')
  getEmi(@Param('id') id: string) {
    return this.emiService.getEmi(id);
  }

  @Delete('plan/:id')
  removeEmi(@Param('id') id: string) {
    return this.emiService.removeEmi(id);
  }

  // BANK endpoints
  @Post('bank')
  createBank(@Body() dto: any) {
    return this.emiService.createBank(dto);
  }

  @Patch('bank/:id')
  updateBank(@Param('id') id: string, @Body() dto: any) {
    return this.emiService.updateBank(id, dto);
  }

  @Get('banks')
  getAllBanks() {
    return this.emiService.getAllBanks();
  }

  @Get('bank/:id')
  getBank(@Param('id') id: string) {
    return this.emiService.getBank(id);
  }

  @Delete('bank/:id')
  removeBank(@Param('id') id: string) {
    return this.emiService.removeBank(id);
  }
}

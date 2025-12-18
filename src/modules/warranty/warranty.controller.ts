import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { ActivateWarrantyDto, WarrantyLookupDto } from './dto/warranty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('warranty')
@Controller('warranty')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post('activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate warranty (Admin/Management)' })
  async activate(
    @Body() dto: ActivateWarrantyDto,
    @CurrentUser() user: { email: string },
  ) {
    const warranty = await this.warrantyService.activate(dto, user.email);
    return {
      ...warranty,
      id: warranty.id?.toString?.() ?? String(warranty.id),
    };
  }

  @Post('lookup')
  @ApiOperation({ summary: 'Lookup warranty by IMEI/Serial and Phone' })
  async lookup(@Body() dto: WarrantyLookupDto) {
    const warranty = await this.warrantyService.lookup(dto);
    return {
      ...warranty,
      id: warranty.id?.toString?.() ?? String(warranty.id),
    };
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warranty logs (Admin/Management)' })
  async getLogs(@Param('id') id: string) {
    return await this.warrantyService.getLogs(id);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add warranty (Admin/Management)' })
  async add(
    @Body() dto: ActivateWarrantyDto,
    @CurrentUser() user: { email: string },
  ) {
    const warranty = await this.warrantyService.activate(dto, user.email);
    return {
      ...warranty,
      id: warranty.id?.toString?.() ?? String(warranty.id),
    };
  }

  @Post('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update warranty (Admin/Management)' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<ActivateWarrantyDto>,
    @CurrentUser() user: { email: string },
  ) {
    const warranty = await this.warrantyService.update(id, dto, user.email);
    return {
      ...warranty,
      id: warranty.id?.toString?.() ?? String(warranty.id),
    };
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'management')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete warranty (Admin/Management)' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { email: string },
  ) {
    return await this.warrantyService.delete(id, user.email);
  }
}

import { Controller, Post, Req, Body } from '@nestjs/common';
import { MetaService } from './meta.service';
import type { Request } from 'express';
import { LeadDto } from './dto/lead.dto';
import { PurchaseDto } from './dto/purchase.dto';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post('pageview')
  async pageView(@Req() req: Request) {
    await this.metaService.sendEvent('PageView', {
      url: req.headers.referer || 'https://unknown',
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
    return { message: 'PageView event sent' };
  }

  @Post('lead')
  async lead(@Req() req: Request, @Body() body: LeadDto) {
    await this.metaService.sendEvent('Lead', {
      url: req.headers.referer || 'https://unknown',
      email: body.email,
      phone: body.phone,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
    return { message: 'Lead event sent' };
  }

  @Post('purchase')
  async purchase(@Req() req: Request, @Body() body: PurchaseDto) {
    await this.metaService.sendEvent('Purchase', {
      url: req.headers.referer || 'https://unknown',
      email: body.email,
      phone: body.phone,
      ip: req.ip,
      ua: req.headers['user-agent'],
      customData: {
        currency: 'BDT',
        value: body.amount,
        order_id: body.orderId,
      },
    });
    return { message: 'Purchase event sent' };
  }
}

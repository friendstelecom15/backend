import { Controller, Post, Req, Body } from '@nestjs/common';
import { MetaService } from './meta.service';
import type { Request } from 'express';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post('pageview')
  pageView(@Req() req: Request) {
    return this.metaService.sendEvent('PageView', {
      url: req.headers.referer,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
  }

  @Post('lead')
  lead(@Req() req: Request, @Body() body: any) {
    return this.metaService.sendEvent('Lead', {
      url: req.headers.referer,
      email: body.email,
      phone: body.phone,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
  }

  @Post('purchase')
  purchase(@Req() req: Request, @Body() body: any) {
    return this.metaService.sendEvent('Purchase', {
      url: req.headers.referer,
      email: body.email,
      phone: body.phone,
      customData: {
        currency: 'BDT',
        value: body.amount,
        order_id: body.orderId,
      },
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
  }
}

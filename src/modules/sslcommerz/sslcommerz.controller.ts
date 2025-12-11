import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { SslCommerzService } from './sslcommerz.service';

@Controller('sslcommerz')
export class SslCommerzController {
  constructor(private readonly sslCommerzService: SslCommerzService) {}

  @Post('initiate')
  async initiatePayment(@Body() body: any, @Req() req, @Res() res) {
    const result = await this.sslCommerzService.initiatePayment(body, req);
    return res.json(result);
  }

  @Post('ipn')
  async handleIpn(@Body() body: any, @Req() req, @Res() res) {
    const result = await this.sslCommerzService.handleIpn(body, req);
    return res.json(result);
  }
}

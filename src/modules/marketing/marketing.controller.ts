import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('email')
  @ApiOperation({ summary: 'Send marketing email' })
  sendEmail(@Body() emailData: EmailData) {
    return this.marketingService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.body,
    );
  }
}

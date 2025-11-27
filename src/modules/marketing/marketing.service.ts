import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketingService {
  trackPixelEvent(eventData: Record<string, unknown>): {
    success: boolean;
    event: Record<string, unknown>;
  } {
    return { success: true, event: eventData };
  }

  sendEmail(
    to: string,
    subject: string,
    body: string,
  ): {
    success: boolean;
    to: string;
    subject: string;
    body: string;
  } {
    return { success: true, to, subject, body };
  }
}

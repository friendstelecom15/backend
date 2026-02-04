import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class MetaService {
  private readonly pixelId = process.env.META_PIXEL_ID;
  private readonly accessToken = process.env.META_ACCESS_TOKEN;
  private readonly testEventCode = process.env.META_TEST_EVENT_CODE;

  constructor(private readonly http: HttpService) {}

  private hash(value?: string) {
    if (!value) return undefined;
    return crypto
      .createHash('sha256')
      .update(value.trim().toLowerCase())
      .digest('hex');
  }

  async sendEvent(eventName: string, payload: any) {
    const url = `https://graph.facebook.com/v18.0/${this.pixelId}/events`;

    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: payload.url,
          user_data: {
            em: this.hash(payload.email),
            ph: this.hash(payload.phone),
            client_ip_address: payload.ip,
            client_user_agent: payload.ua,
          },
          custom_data: payload.customData || {},
        },
      ],
      test_event_code: this.testEventCode,
    };

    return firstValueFrom(
      this.http.post(url, body, {
        params: { access_token: this.accessToken },
      }),
    );
  }
}

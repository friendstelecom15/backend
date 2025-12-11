import { Module } from '@nestjs/common';
import { SslCommerzController } from './sslcommerz.controller';
import { SslCommerzService } from './sslcommerz.service';

@Module({
  controllers: [SslCommerzController],
  providers: [SslCommerzService],
  exports: [SslCommerzService],
})
export class SslCommerzModule {}

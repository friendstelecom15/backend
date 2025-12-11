import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SslCommerzService {
  async initiatePayment(paymentData: any, req: any) {
    // TODO: Replace with your SSLCommerz credentials and endpoint
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const url = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const payload = {
      ...paymentData,
      store_id: storeId,
      store_passwd: storePasswd,
      currency: 'BDT',
      success_url: paymentData.success_url,
      fail_url: paymentData.fail_url,
      cancel_url: paymentData.cancel_url,
      ipn_url: paymentData.ipn_url,
    };

    const response = await axios.post(url, payload);
    return response.data;
  }

  async handleIpn(ipnData: any, req: any) {
    // Handle IPN (Instant Payment Notification) from SSLCommerz
    // You can verify payment and update order status here
    return { status: 'received', data: ipnData };
  }
}

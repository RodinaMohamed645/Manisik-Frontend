import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePaymentRequest,
  PaymentResponse,
  PayPalCaptureRequest,
} from '../../interfaces/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createPayment(payload: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/Stripe/CreatePayment`,
      payload,
      { withCredentials: true }
    );
  }

  capturePayPalOrder(
    payload: PayPalCaptureRequest
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/Payment/CapturePayPalOrder`,
      payload,
      { withCredentials: true }
    );
  }

  confirmStripePayment(paymentIntentId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/Stripe/ConfirmPayment`,
      { paymentIntentId },
      { withCredentials: true }
    );
  }
}


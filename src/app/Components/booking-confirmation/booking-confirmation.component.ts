import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.css',
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private auth = inject(AuthService);
  private i18n = inject(I18nService);

  bookingId: string = '';
  booking: any = null;
  isLoading = false;
  isPaymentProcessing = false;
  paymentComplete = false;
  
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  payerName: string = '';
  payerEmail: string = '';
  payerPhone: string = '';
  clientSecret: string | null = null;
  paymentError: string = '';

  async ngOnInit() {
    // Get booking ID from route params
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('id') || '';
      console.log('📋 Booking ID from route:', this.bookingId);
      
      if (this.bookingId) {
        this.loadBookingDetails();
      }
    });

    // Initialize Stripe
    try {
      this.stripe = await loadStripe(environment.stripe.publishableKey);
    } catch (error) {
      console.error('Failed to load Stripe:', error);
      this.toastr.error('Failed to load payment system', 'Error');
    }
  }

  async loadBookingDetails() {
    this.isLoading = true;
    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/Booking/BookingId/${this.bookingId}`, { headers })
      );

      console.log('✅ Booking details loaded:', response);
      this.booking = response.data || response;

      // Extract payer details (Main Traveler)
      if (this.booking?.travelers?.length) {
        const mainTraveler = this.booking.travelers.find((t: any) => t.isMainTraveler) || this.booking.travelers[0];
        this.payerName = `${mainTraveler.firstName} ${mainTraveler.lastName}`;
        this.payerEmail = mainTraveler.email;
        this.payerPhone = mainTraveler.phoneNumber || mainTraveler.phone || '';
      }

    } catch (error: any) {
      this.toastr.error(
        this.i18n.translate('toast.dashboard.load.error'), 
        this.i18n.translate('toast.error.title')
      );
    } finally {
      this.isLoading = false;
    }
  }

  async initiatePayment() {
    if (!this.stripe || !this.booking) {
      this.toastr.error('Payment system not ready', 'Error');
      return;
    }

    this.isPaymentProcessing = true;
    this.paymentError = '';

    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Ensure we use the numeric ID from the loaded booking object
      const numericBookingId = this.booking.id;

      const payload = {
        bookingId: numericBookingId,
        currency: 'usd',
        idempotencyKey: `booking-${numericBookingId}-${Date.now()}`
      };

      const response: any = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/Stripe/create-payment`, payload, { headers })
      );

      if (!response.clientSecret) {
        throw new Error('No client secret received from server');
      }

      this.clientSecret = response.clientSecret;
      
      // Initialize Stripe Elements
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret!,
        appearance: { theme: 'stripe' }
      });

      // Create and mount the Payment Element
      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');

    } catch (error: any) {
      this.paymentError = error.message || 'Failed to initialize payment';
      this.toastr.error(this.paymentError, 'Error');
    } finally {
      this.isPaymentProcessing = false;
    }
  }

  async confirmPayment() {
    if (!this.stripe || !this.elements) {
      return;
    }

    this.isPaymentProcessing = true;
    this.paymentError = '';

    try {
      const result = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation/${this.bookingId}`,
          payment_method_data: {
            billing_details: {
              name: this.payerName,
              email: this.payerEmail,
              phone: this.payerPhone
            }
          }
        },
        redirect: 'if_required'
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        this.paymentComplete = true;
        this.toastr.success('Payment successful! Redirecting to dashboard...', 'Success');
        
        // Clear booking data after successful payment
        this.auth.clearUserBookingData();
        console.log('✅ Booking data cleared after successful payment');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Payment confirmation failed:', error);
      this.paymentError = error.message || 'Payment failed';
      this.toastr.error(this.paymentError, 'Error');
    } finally {
      this.isPaymentProcessing = false;
    }
  }

  /**
   * Generate a simple PDF receipt for the currently loaded booking using jsPDF.
   * If jsPDF fails for any reason, the method displays a toast and logs the error.
   */
  downloadReceipt() {
    if (!this.booking) {
      this.toastr.warning('No booking data available to generate receipt.', 'Warning');
      return;
    }

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      let y = 60;

      doc.setFontSize(18);
      doc.text('Booking Receipt', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
      y += 30;

      doc.setFontSize(12);
      const id = this.booking.id ?? this.booking.bookingId ?? this.booking.bookingNumber ?? this.bookingId;
      doc.text(`Booking ID: ${id}`, margin, y);
      y += 18;

      const total = this.booking.totalPrice ?? this.booking.totalPriceAmount ?? 0;
      doc.text(`Total Price: $${total}`, margin, y);
      y += 18;

      if (this.booking.travelStartDate) {
        doc.text(`Travel Start: ${new Date(this.booking.travelStartDate).toLocaleString()}`, margin, y);
        y += 16;
      }
      if (this.booking.travelEndDate) {
        doc.text(`Travel End: ${new Date(this.booking.travelEndDate).toLocaleString()}`, margin, y);
        y += 16;
      }

      y += 8;
      doc.setFontSize(14);
      doc.text('Traveler(s):', margin, y);
      y += 16;
      doc.setFontSize(11);

      if (Array.isArray(this.booking.travelers) && this.booking.travelers.length) {
        this.booking.travelers.forEach((t: any, idx: number) => {
          const name = `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim();
          const email = t.email ?? '';
          const phone = t.phoneNumber ?? t.phone ?? '';
          const line = `${idx + 1}. ${name} — ${email} — ${phone}`;

          // Page break handling
          if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = 60;
          }

          doc.text(line, margin, y);
          y += 14;
        });
      } else {
        doc.text('No traveler information available', margin, y);
        y += 14;
      }

      // Footer
      doc.setFontSize(10);
      const footer = `Generated: ${new Date().toLocaleString()}`;
      doc.text(footer, margin, doc.internal.pageSize.getHeight() - 30);

      const filename = `booking_receipt_${id}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      this.toastr.error('Failed to generate receipt PDF', 'Error');
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

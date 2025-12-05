import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-4">Booking Confirmation</h1>
      <p *ngIf="bookingId">Your booking ID: <strong>{{ bookingId }}</strong></p>
      <p *ngIf="paymentIntentId">Payment: <strong>{{ paymentIntentId }}</strong></p>
      <p *ngIf="!bookingId">No booking information available.</p>
      <div class="mt-6">
        <a routerLink="/" class="text-blue-600">Back to home</a>
      </div>
    </div>
  `
})
export class BookingConfirmationComponent implements OnInit {
  bookingId: string | null = null;
  paymentIntentId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('bookingId');
    this.paymentIntentId = this.route.snapshot.queryParamMap.get('paymentIntentId');
  }
}

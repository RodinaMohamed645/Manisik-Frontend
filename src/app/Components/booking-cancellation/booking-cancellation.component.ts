import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-cancellation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-cancellation.component.html',
  styleUrl: './booking-cancellation.component.css',
})
export class BookingCancellationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bookingId: string | null = null;

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.bookingId = params.get('bookingId');
    });
  }

  retryPayment() {
    this.router.navigate(['/booking-package']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}


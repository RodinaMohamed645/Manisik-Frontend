import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportService } from 'src/app/core/services/transport.service';
import { BookingGroundService } from 'src/app/core/services/booking-ground.service';
import { BookingsService } from 'src/app/core/services/bookings.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, map, finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-booking-ground',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-ground.component.html'
})
export class BookingGroundComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transportService = inject(TransportService);
  private readonly bookingGroundService = inject(BookingGroundService);
  private readonly bookingsService = inject(BookingsService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  ground: any = null;
  bookingForm!: FormGroup;
  pricePerPerson: number = 0;
  total: number = 0;
  isSubmitting = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('groundTransportId')) || null;
    
    // Initialize form first
    this.bookingForm = this.fb.group({
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      pickupLocation: ['', [Validators.required, Validators.maxLength(200)]],
      dropoffLocation: ['', [Validators.required, Validators.maxLength(200)]]
    });

    // Subscribe to passenger changes to recalculate total
    this.bookingForm.get('passengers')?.valueChanges.subscribe(() => {
      this.recalculateTotal();
    });

    const navState: any = (history && (history.state as any)) || {};
    if (navState && navState.groundTransport) {
      this.ground = navState.groundTransport;
      this.setupGroundData(this.ground);
      return;
    }

    if (id) {
      this.transportService.getGroundById(id).subscribe({
        next: (res) => {
          this.ground = res;
          this.setupGroundData(res);
        },
        error: (err) => {

          this.toastr.error('Failed to load ground transport details', 'Error');
          this.router.navigate(['/transport']);
        }
      });
    } else {
      this.toastr.error('Missing ground transport id', 'Error');
      this.router.navigate(['/transport']);
    }
  }

  setupGroundData(data: any) {
    this.pricePerPerson = Number(data?.pricePerPerson || data?.price || 0);
    // Pre-fill if available
    if (data.pickupLocation || data.from) {
      this.bookingForm.patchValue({ pickupLocation: data.pickupLocation || data.from });
    }
    if (data.dropoffLocation || data.to) {
      this.bookingForm.patchValue({ dropoffLocation: data.dropoffLocation || data.to });
    }
    this.recalculateTotal();
  }

  recalculateTotal() {
    const passengers = this.bookingForm.get('passengers')?.value || 0;
    this.total = (Number(this.pricePerPerson) || 0) * (Number(passengers) || 0);
  }

  submit() {
    if (!this.ground) return;
    
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly', 'Validation');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    const payload = {
      groundTransportId: this.ground.id || this.ground.groundTransportId,
      serviceDate: new Date().toISOString(),
      pickupLocation: formValue.pickupLocation,
      dropoffLocation: formValue.dropoffLocation,
      numberOfPassengers: formValue.passengers
    };

    this.bookingGroundService.bookGround(payload)
      .pipe(
        // Switch context to fetch pending bookings immediately after success
        switchMap((res: any) => {
          this.toastr.success('Ground transport booked successfully', 'Success');
          // Return the pending bookings observable stream
          return this.bookingsService.getMyPendingGroundBookings().pipe(
             // Map result to include the original response if needed, or just process here
             map(pending => ({ res, pending })),
             catchError(() => of({ res, pending: [] })) // Fallback if fetch fails
          );
        }),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: ({ res, pending }) => {
          try {
            const current = this.auth.getBookingData() || {};
            const draft: any = { ...(current || {}) };
            
            if (pending && pending.length) {
              const latest = pending[pending.length - 1]; // Use latest
              draft.groundData = latest;
              if (latest.bookingId) {
                draft.bookingId = latest.bookingId;
              }
            } else {
               // Fallback to local data
               draft.groundData = res.data;
            }
            
            this.auth.saveBookingData(draft);
          } catch (e) {
            console.warn('Error updating local booking state', e);
          }

          this.router.navigate(['/booking-package']);
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Failed to book ground transport';
          this.toastr.error(msg);
        }
      });
  }

  cancel() {
    this.router.navigate(['/transport']);
  }
}


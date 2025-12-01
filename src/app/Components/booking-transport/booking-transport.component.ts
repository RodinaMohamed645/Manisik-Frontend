import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BookingTransportService } from 'src/app/core/services/booking-transport.service';
import { TransportService } from 'src/app/core/services/transport.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { InternationalTransportBooking } from 'src/app/interfaces';

@Component({
  selector: 'app-booking-transport',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './booking-transport.component.html',
  styleUrl: './booking-transport.component.css',
})
export class BookingTransportComponent implements OnInit {
  readonly i18n = inject(I18nService);
  bookingForm!: FormGroup;
  transportId!: number;
  transport: any = null;
  totalPrice: number = 0;
  private route = inject(ActivatedRoute);
  private bookingId!: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingTransportService,
    private transportService: TransportService,
    private toastr: ToastrService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.ensureBookingId();
    this.initializeForm();
    this.applyTransportFromState(history.state?.transport);

    this.route.queryParams.subscribe((params) => {
      const tId = +params['transportId'];
      if (isNaN(tId)) {
        if (!this.transport) {
          this.router.navigate(['/transport']);
        }
        return;
      }

      if (!this.transport || this.transportId !== tId) {
        this.transportId = tId;
        this.loadTransportDetails();
      }
    });
  }

  loadTransportDetails() {
    this.transportService.getInternationalById(this.transportId).subscribe({
      next: (transport) => {
        this.transport = transport;
        this.patchTransportForm(transport);
      },
      error: () => {
        this.toastr.error(
          this.i18n.translate('toast.error.loadFailed'),
          this.i18n.translate('toast.error.title')
        );
      },
    });
  }

  calculateTotalPrice() {
    const { numberOfSeats, pricePerSeat } = this.bookingForm.value;
    if (!numberOfSeats || !pricePerSeat) return;
    this.totalPrice = numberOfSeats * pricePerSeat;
  }

  submitBooking() {
    if (this.bookingForm.invalid) {
      this.toastr.warning(
        this.i18n.translate('toast.booking.formInvalid'),
        this.i18n.translate('toast.warning.title')
      );
      return;
    }

    const formValue = this.bookingForm.value;
    const departureDateISO = new Date(formValue.departureDate).toISOString();

    const bookingDto: InternationalTransportBooking = {
      bookingId: this.bookingId,
      transportId: this.transportId,
      type: formValue.type,
      carrierName: formValue.carrierName,
      flightNumber: formValue.flightNumber || '',
      shipNumber: formValue.shipNumber || '',
      departureAirport: formValue.departureAirport,
      arrivalAirport: formValue.arrivalAirport,
      departureDate: departureDateISO,
      numberOfSeats: formValue.numberOfSeats,
      pricePerSeat: formValue.pricePerSeat,
      totalPrice: this.totalPrice,
    };

    this.isSubmitting = true;

    this.bookingService.bookTransport(bookingDto).subscribe({
      next: () => {
        this.persistInternationalBooking(bookingDto);
        this.toastr.success(
          this.i18n.translate('toast.booking.success'),
          this.i18n.translate('toast.success.title')
        );
        this.redirectAfterInternational();
      },
      error: () => {
        this.toastr.error(
          this.i18n.translate('toast.booking.failed'),
          this.i18n.translate('toast.error.title')
        );
        this.isSubmitting = false;
      },
    });
  }

  private initializeForm() {
    this.bookingForm = this.fb.group({
      type: [0, Validators.required],
      carrierName: ['', Validators.required],
      flightNumber: [''],
      shipNumber: [''],
      departureAirport: ['', Validators.required],
      arrivalAirport: ['', Validators.required],
      departureDate: ['', Validators.required],
      numberOfSeats: [1, [Validators.required, Validators.min(1)]],
      pricePerSeat: [0, [Validators.required, Validators.min(0)]],
    });

    this.bookingForm.get('type')?.valueChanges.subscribe((type) => {
      if (type === 0) {
        this.bookingForm.get('flightNumber')?.setValidators(Validators.required);
        this.bookingForm.get('shipNumber')?.clearValidators();
      } else {
        this.bookingForm.get('shipNumber')?.setValidators(Validators.required);
        this.bookingForm.get('flightNumber')?.clearValidators();
      }
      this.bookingForm.get('flightNumber')?.updateValueAndValidity();
      this.bookingForm.get('shipNumber')?.updateValueAndValidity();
    });

    this.bookingForm.valueChanges.subscribe(() => this.calculateTotalPrice());
  }

  private applyTransportFromState(transport: any) {
    if (!transport) return;
    const resolvedId = this.resolveTransportId(transport, true);
    if (!resolvedId) return;
    this.transport = transport;
    this.transportId = resolvedId;
    this.patchTransportForm(transport);
  }

  private patchTransportForm(transport: any) {
    if (!this.bookingForm) return;

    const transportType =
      transport.internationalTransportType === 'Plane'
        ? 0
        : transport.internationalTransportType === 'Ship'
        ? 1
        : transport.type ?? 0;

    this.bookingForm.patchValue({
      type: transportType,
      carrierName: transport.carrierName || '',
      flightNumber: transport.flightNumber || '',
      shipNumber: transport.shipNumber || '',
      departureAirport: transport.departureAirport || '',
      arrivalAirport: transport.arrivalAirport || '',
      departureDate: this.formatDateForInput(
        transport.departureDate || transport.departureTime
      ),
      pricePerSeat: transport.pricePerSeat || transport.price || 0,
    });

    this.calculateTotalPrice();
  }

  private formatDateForInput(dateValue: string | Date | undefined): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  private ensureBookingId(): number {
    const userData = this.auth.getBookingData();
    if (userData?.bookingId) return userData.bookingId;

    const generated = Math.floor(100000 + Math.random() * 900000);

    this.auth.saveBookingData({
      ...userData,
      bookingId: generated,
    });

    return generated;
  }

  private persistInternationalBooking(payload: InternationalTransportBooking) {
    const existing = this.auth.getBookingData() || {};

    this.auth.saveBookingData({
      ...existing,
      transportBooked: true,
      transportData: payload,
      selectedTransportId: this.transportId,
    });
  }

  private redirectAfterInternational() {
    const userBooking = this.auth.getBookingData();
    const groundBooked = userBooking?.groundBooked === true;

    this.isSubmitting = false;

    if (groundBooked) {
      this.router.navigate(['/booking-package']);
      return;
    }

    this.toastr.info(
      'Please complete your ground transport booking to finalize.',
      'Next step'
    );

    this.router.navigate(['/transport'], { queryParams: { tab: 'ground' } });
  }

  private resolveTransportId(transport: any, isInternational = false): number | null {
    const rawId = isInternational
      ? transport?.id ??
        transport?.transportId ??
        transport?.internationalTransportId ??
        null
      : transport?.id ?? transport?.groundTransportId ?? null;

    const parsed = Number(rawId);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

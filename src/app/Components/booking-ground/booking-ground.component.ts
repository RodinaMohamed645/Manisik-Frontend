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
import { BookingGroundService } from 'src/app/core/services/booking-ground.service';
import { TransportService } from 'src/app/core/services/transport.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { GroundTransportBooking } from 'src/app/interfaces';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-booking-ground',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './booking-ground.component.html',
  styleUrl: './booking-ground.component.css',
})
export class BookingGroundComponent implements OnInit {
  readonly i18n = inject(I18nService);
  bookingForm!: FormGroup;
  groundTransportId!: number;
  groundTransport: any = null;
  totalPrice: number = 0;
  private route = inject(ActivatedRoute);
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingGroundService,
    private transportService: TransportService,
    private toastr: ToastrService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.applyGroundFromState(history.state?.groundTransport);

    this.route.queryParams.subscribe((params) => {
      const gId = +params['groundTransportId'];

      if (isNaN(gId)) {
        if (!this.groundTransport) {
          this.router.navigate(['/transport']);
        }
        return;
      }

      if (!this.groundTransport || this.groundTransportId !== gId) {
        this.groundTransportId = gId;
        this.loadGroundTransportDetails();
      }
    });
  }

  loadGroundTransportDetails() {
    this.transportService.getGroundById(this.groundTransportId).subscribe({
      next: (groundTransport) => {
        this.groundTransport = groundTransport;
        this.applyGroundFromState(groundTransport);
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
    const { numberOfPassengers, pricePerPerson } = this.bookingForm.value;
    if (!numberOfPassengers || !pricePerPerson) return;

    this.totalPrice = numberOfPassengers * pricePerPerson;
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

    const bookingDto: GroundTransportBooking = {
      groundTransportId: this.groundTransportId,
      serviceName: formValue.serviceName,
      type: formValue.type,
      serviceDate: new Date(formValue.serviceDate).toISOString(),
      pickupLocation: formValue.pickupLocation,
      dropoffLocation: formValue.dropoffLocation,
      numberOfPassengers: formValue.numberOfPassengers,
      pricePerPerson: formValue.pricePerPerson,
      totalPrice: this.totalPrice,
    };

    this.isSubmitting = true;

    this.bookingService.bookGround(bookingDto).subscribe({
      next: () => {
        this.persistGroundBooking(bookingDto);
        this.toastr.success(
          this.i18n.translate('toast.booking.success'),
          this.i18n.translate('toast.success.title')
        );
        this.redirectAfterGround();
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
      serviceName: ['', Validators.required],
      type: [0, Validators.required],
      serviceDate: ['', Validators.required],
      pickupLocation: ['', Validators.required],
      dropoffLocation: ['', Validators.required],
      numberOfPassengers: [1, [Validators.required, Validators.min(1)]],
      pricePerPerson: [0, [Validators.required, Validators.min(0)]],
    });

    this.bookingForm.valueChanges.subscribe(() => this.calculateTotalPrice());
  }

  private applyGroundFromState(groundTransport: any) {
    if (!groundTransport) return;

    const id =
      groundTransport?.id ??
      groundTransport?.groundTransportId ??
      groundTransport?.internalTransportId;

    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) return;

    this.groundTransport = groundTransport;
    this.groundTransportId = parsedId;

    const patch: any = {};

    if (groundTransport.serviceName !== undefined)
      patch.serviceName = groundTransport.serviceName;

    if (groundTransport.type !== undefined)
      patch.type = groundTransport.type;

    if (groundTransport.serviceDate)
      patch.serviceDate = this.formatDateForInput(groundTransport.serviceDate);

    if (groundTransport.pickupLocation)
      patch.pickupLocation = groundTransport.pickupLocation;

    if (groundTransport.dropoffLocation)
      patch.dropoffLocation = groundTransport.dropoffLocation;

    if (groundTransport.numberOfPassengers)
      patch.numberOfPassengers = groundTransport.numberOfPassengers;

    if (groundTransport.pricePerPerson !== undefined)
      patch.pricePerPerson = groundTransport.pricePerPerson;

    if (Object.keys(patch).length) {
      this.bookingForm.patchValue(patch);
    }

    this.calculateTotalPrice();
  }

  private formatDateForInput(value: string | Date): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }


  // --------------- UPDATED FOR PER-USER STORAGE -----------------

  private persistGroundBooking(payload: GroundTransportBooking) {
    const current = this.auth.getBookingData() || {};

    this.auth.saveBookingData({
      ...current,
      groundBooked: true,
      groundData: payload,
      selectedGroundTransportId: this.groundTransportId,
    });
  }

  private redirectAfterGround() {
    const data = this.auth.getBookingData();
    const internationalBooked = data?.transportBooked === true;

    this.isSubmitting = false;

    if (internationalBooked) {
      this.router.navigate(['/booking-package']);
      return;
    }

    this.toastr.info(
      'Please complete your international transport booking to continue.',
      'Next step'
    );

    this.router.navigate(['/transport'], {
      queryParams: { tab: 'international' },
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { I18nService } from 'src/app/core/services/i18n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AirArrivalAirport, SeaArrivalAirport, TransportSearchParams, AirDepartureAirport, SeaDepartureAirport, TransportOption, GroundTransport } from 'src/app/interfaces/transport.interface';
import { TransportService } from 'src/app/core/services/transport.service';
import { BookingsService } from 'src/app/core/services/bookings.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css']
})
export class TransportComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bookingsService = inject(BookingsService);
  private readonly transportService = inject(TransportService);
  private readonly authService = inject(AuthService);

  // Airports represented as `{ key, label }` so frontend sends enum key (expected by backend)
  arrivalAirports: Array<{ key: string; label: string }> = Object.keys(AirArrivalAirport).map(k => ({ key: k, label: (AirArrivalAirport as any)[k] }));
  departureAirports: Array<{ key: string; label: string }> = Object.keys(AirDepartureAirport).map(k => ({ key: k, label: (AirDepartureAirport as any)[k] }));

  searchParams: TransportSearchParams = {
    departureLocation: '',
    arrivalLocation: '',
    departureDate: undefined,
    returnDate: undefined,
    type: 'Plane'
  };

  flights: TransportOption[] = [];
  errorMessage: string = '';

  groundTransports: GroundTransport[] = [];
  groundErrorMessage: string = '';

  // Pending Bookings
  pendingGroundBooking: any = null;
  pendingTransportBooking: any = null;

  // Active filter tracking
  activeGroundFilter: string = 'All';
  activeInternationalFilter: string = 'Plane';

  // Theme handling removed to avoid conflict with Navbar/App component
  // isDarkTheme: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Load all data by default
    this.loadAllGroundTransports();
    this.loadAllInternationalTransports();

    // Check pending bookings from local logic
    this.checkPendingBookings();

    // specific fix for query params
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'ground') {
        setTimeout(() => {
          const element = document.getElementById('ground-transport-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500); // delay to ensure rendering
      }
    });
  }

  /**
   * Loads all ground transports (default view)
   */
  loadAllGroundTransports() {
    this.activeGroundFilter = 'All';
    this.transportService.getAllGroundTransports().subscribe({
      next: (response) => {
        // Process ground transports data
        this.groundTransports = (response.data || []).map((gt: any) => ({
          ...gt,
          serviceName: gt.serviceName || gt.ServiceName,
          type: gt.type || gt.Type,
          pricePerPerson: gt.pricePerPerson || gt.PricePerPerson,
          rate: gt.rate || gt.Rate,
          route: gt.route || gt.Route,
          duration: gt.duration || gt.Duration,
          amenities: (gt.description || gt.Description)?.split(',').map((a: string) => a.trim()) || []
        }));
        // Ground transports mapped successfully
        this.groundErrorMessage = '';
      },
      error: (err) => {
        this.groundTransports = [];
        this.groundErrorMessage = 'Failed to load ground transports';

      }
    });
  }

  getDurationInHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return (endTime - startTime) / (1000 * 60 * 60);
  }

  /**
   * Loads all international transports (default view)
   */
  loadAllInternationalTransports() {
    this.transportService.getTransportOptions().subscribe({
      next: (response) => {
        this.flights = (response.data || []).map((f: any) => ({
          ...f,
          id: f.id || f.Id || f.internationalTransportId || f.InternationalTransportId,
          carrierName: f.carrierName || f.CarrierName,
          flightClass: f.flightClass || f.FlightClass,
          stops: f.stops || f.Stops,
          price: f.price || f.Price,
          duration: f.duration || f.Duration,
          internationalTransportType: f.transportType || f.TransportType || f.internationalTransportType || f.InternationalTransportType,
          // ensure departure/arrival values are present (prefer provided field or fallback to any casing)
          departureAirport: f.departureAirport || f.DepartureAirport || f.departure || f.departureAirportCode,
          arrivalAirport: f.arrivalAirport || f.ArrivalAirport || f.arrival || f.arrivalAirportCode
        }));
        this.errorMessage = '';
      },
      error: (err) => {
        this.flights = [];
        this.errorMessage = 'Failed to load international transports';

      }
    });
  }

  setTransportType(type: string) {
    this.activeInternationalFilter = type;
    this.searchParams.type = type;

    // Reset select values
    this.searchParams.departureLocation = null;
    this.searchParams.arrivalLocation = null;

    if (type === 'Plane') {
      this.arrivalAirports = Object.keys(AirArrivalAirport).map(k => ({ key: k, label: (AirArrivalAirport as any)[k] }));
      this.departureAirports = Object.keys(AirDepartureAirport).map(k => ({ key: k, label: (AirDepartureAirport as any)[k] }));
    } else if (type === 'Ship') {
      this.arrivalAirports = Object.keys(SeaArrivalAirport).map(k => ({ key: k, label: (SeaArrivalAirport as any)[k] }));
      this.departureAirports = Object.keys(SeaDepartureAirport).map(k => ({ key: k, label: (SeaDepartureAirport as any)[k] }));
    }

    this.getAllTransportFilteredByType(type);
  }

  searchflight() {
    if (this.searchParams.departureLocation && this.searchParams.arrivalLocation) {
      this.transportService
        .searchByRoute(this.searchParams.departureLocation, this.searchParams.arrivalLocation)
        .subscribe({
          next: (response) => {
            this.flights = (response.data || []).map((f: any) => ({
              ...f,
              id: f.id || f.Id || f.internationalTransportId || f.InternationalTransportId,
              carrierName: f.carrierName || f.CarrierName,
              flightClass: f.flightClass || f.FlightClass,
              stops: f.stops || f.Stops,
              price: f.price || f.Price,
              duration: f.duration || f.Duration,
              internationalTransportType: f.transportType || f.TransportType || f.internationalTransportType || f.InternationalTransportType,
              departureAirport: f.departureAirport || f.DepartureAirport || f.departure || f.departureAirportCode,
              arrivalAirport: f.arrivalAirport || f.ArrivalAirport || f.arrival || f.arrivalAirportCode
            }));
            this.errorMessage = '';
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'حدث خطأ أثناء البحث';
            this.flights = [];
          }
        });
    } else if (this.searchParams.departureDate && this.searchParams.returnDate) {
      this.transportService
        .searchByDateRange(this.searchParams.departureDate, this.searchParams.returnDate)
        .subscribe({
          next: (response) => {
            this.flights = (response.data || []).map((f: any) => ({
              ...f,
              id: f.id || f.Id || f.internationalTransportId || f.InternationalTransportId,
              carrierName: f.carrierName || f.CarrierName,
              flightClass: f.flightClass || f.FlightClass,
              stops: f.stops || f.Stops,
              price: f.price || f.Price,
              duration: f.duration || f.Duration,
              internationalTransportType: f.transportType || f.TransportType || f.internationalTransportType || f.InternationalTransportType,
              departureAirport: f.departureAirport || f.DepartureAirport || f.departure || f.departureAirportCode,
              arrivalAirport: f.arrivalAirport || f.ArrivalAirport || f.arrival || f.arrivalAirportCode
            }));
            this.errorMessage = '';
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'حدث خطأ أثناء البحث';
            this.flights = [];
          }
        });
    }
  }

  getAllTransportFilteredByType(type: string) {
    this.transportService.getTransportOptions().subscribe({
      next: (response) => {
        const wanted = (type || '').toString().toLowerCase();
        this.flights = (response.data || []).filter((f: any) => {
          const a = (f.transportType ?? f.TransportType ?? f.internationalTransportType ?? f.InternationalTransportType ?? '').toString().toLowerCase();
          return a === wanted;
        }).map((f: any) => ({
          ...f,
          id: f.id || f.Id || f.internationalTransportId || f.InternationalTransportId,
          carrierName: f.carrierName || f.CarrierName,
          flightClass: f.flightClass || f.FlightClass,
          stops: f.stops || f.Stops,
          price: f.price || f.Price,
          duration: f.duration || f.Duration,
          internationalTransportType: f.transportType || f.TransportType || f.internationalTransportType || f.InternationalTransportType
        }));
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'فشل في جلب الرحلات';
        this.flights = [];
      }
    });
  }

  searchByType(type: string) {
    this.activeGroundFilter = type;
    // Call backend with the provided type string; backend may accept either numeric or string enum values.
    this.transportService.getTransportsByType(type).subscribe({
      next: (response) => {
        // Normalize/flatten returned data and ensure `type` is a consistent string we can compare in the UI.
        this.groundTransports = (response.data || []).map((gt: any) => {
          const normalizedType = (gt.type ?? gt.Type ?? gt.internalTransportType ?? gt.InternalTransportType ?? '').toString();
          return {
            ...gt,
            serviceName: gt.serviceName || gt.ServiceName,
            type: normalizedType,
            pricePerPerson: gt.pricePerPerson || gt.PricePerPerson,
            rate: gt.rate || gt.Rate,
            route: gt.route || gt.Route,
            duration: gt.duration || gt.Duration,
            amenities: (gt.description || gt.Description)?.split(',').map((a: string) => a.trim()) || []
          } as any;
        });
        this.groundErrorMessage = '';
      },
      error: (err) => {

        this.groundTransports = [];
        this.groundErrorMessage = 'Failed to load transport data';
      }
    });
  }

  bookFlight(flight: any) {
    this.router.navigate(['booking/international'], { state: { selectedFlight: flight } });
  }

  bookGroundTransport(transport: any) {
    this.router.navigate(['booking-ground'], { state: { groundTransport: transport } });
  }

  checkPendingBookings() {
    // Check Ground Transport
    this.bookingsService.getMyPendingGroundBookings().subscribe({
      next: (bookings) => {
        if (bookings && bookings.length > 0) {
          this.pendingGroundBooking = bookings[0];
        }
      }
    });

    // Check International Transport
    this.bookingsService.getMyPendingTransportBookings().subscribe({
      next: (bookings) => {
        if (bookings && bookings.length > 0) {
          this.pendingTransportBooking = bookings[0];
        }
      }
    });
  }

  discardGroundDraft() {
    if (!this.pendingGroundBooking) return;

    if (confirm(this.i18n.isRTL() ? 'هل أنت متأكد من حذف حجز النقل البري المعلق؟' : 'Are you sure you want to discard the pending ground transport booking?')) {
      this.bookingsService.deletePendingGroundBooking(this.pendingGroundBooking.id).subscribe({
        next: () => {
          this.pendingGroundBooking = null;
          this.toastr.success(
            this.i18n.isRTL() ? 'تم حذف الحجز المعلق' : 'Pending booking discarded',
            this.i18n.translate('success')
          );
        },
        error: () => {
          this.toastr.error(
            this.i18n.isRTL() ? 'فشل حذف الحجز' : 'Failed to discard booking',
            this.i18n.translate('error')
          );
        }
      });
    }
  }

  discardTransportDraft() {
    if (!this.pendingTransportBooking) return;

    if (confirm(this.i18n.isRTL() ? 'هل أنت متأكد من حذف حجز الطيران المعلق؟' : 'Are you sure you want to discard the pending flight booking?')) {
      this.bookingsService.deletePendingTransportBooking(this.pendingTransportBooking.id).subscribe({
        next: () => {
          this.pendingTransportBooking = null;
          this.toastr.success(
            this.i18n.isRTL() ? 'تم حذف الحجز المعلق' : 'Pending booking discarded',
            this.i18n.translate('success')
          );
        },
        error: () => {
          this.toastr.error(
            this.i18n.isRTL() ? 'فشل حذف الحجز' : 'Failed to discard booking',
            this.i18n.translate('error')
          );
        }
      });
    }
  }

  formatDurationString(value: string): string {
    if (!value) return '';
    // Split by " : " (spaces around colon)
    const parts = value.split(' : ');
    if (parts.length !== 3) return value; // fallback if format is unexpected
    const [hours, minutes, seconds] = parts;
    return `${hours} days - ${minutes} hour - ${seconds} min`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(price);
  }
}

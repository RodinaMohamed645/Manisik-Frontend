import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HotelsService } from '../../core/services/hotels.service';
import { Hotel } from './../../interfaces/hotel.interface';
import {
  PaymentProvider,
  CreatePaymentRequest,
} from './../../interfaces/payment.interface';
import { PaymentService } from '../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements,
} from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BookingsService } from '../../core/services/bookings.service';
import { CreateBookingRequest, TripType } from '../../interfaces/booking.interface';

type BookingSnapshot = {
  makkahHotel: any;
  madinahHotel: any;
  internationalTransport: any;
  groundTransport: any;
};

import { I18nService } from '../../core/services/i18n.service';
import { CountriesService, Country } from '../../core/services/countries.service';

import { 
  LucideAngularModule, 
  Check, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  Building2, 
  MapPin, 
  Star, 
  Navigation, 
  Bed, 
  Mail, 
  FileText, 
  ChevronDown, 
  AlertCircle, 
  User, 
  Flag, 
  Globe, 
  CreditCard, 
  Plane, 
  Bus, 
  Building
} from 'lucide-angular';

@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule
  ],
  templateUrl: './booking-package.component.html',
  styleUrls: ['./booking-package.component.css'],
})
export class BookingPackageComponent implements OnDestroy {
  @ViewChild('cardElement')
  set cardElementRef(value: ElementRef<HTMLDivElement> | undefined) {
    this.cardElementHost = value;
    if (value && this.clientSecret) {
      this.mountStripeCard();
    }
  }

  readonly stripeConfig = environment.stripe;

  hotels: Hotel[] = [];
  selectedTripType: 'umrah' | 'hajj' = 'umrah';

  hotelBookedMessage = '';
  transportBookedMessage = '';
  groundBookedMessage = '';

  bookingId = 0;
  totalAmount = 0;

  // Country & Phone
  countries: Country[] = [];
  selectedPhoneCountry: Country | null = null;

  passenger = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    passport: '',
    passportExpiry: '',
    passportIssuingCountry: '',
    nationality: '',
    gender: 0, // 0 = Male, 1 = Female
  };

  paymentMethod: 'stripe' | 'cash' = 'stripe';

  clientSecret: string | null = null;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement?: StripeCardElement;
  private cardElementHost?: ElementRef<HTMLDivElement>;

  isFinalizing = false;
  isPaymentProcessing = false;
  paymentError = '';
  paymentSuccess = '';

  // Document requirements visibility
  showDocumentRequirements = true;

  constructor(
    private hotelApi: HotelsService,
    private router: Router,
    private paymentService: PaymentService,
    private bookingsService: BookingsService,
    private toastr: ToastrService,
    private auth: AuthService,
    public i18nService: I18nService,
    private countriesService: CountriesService
  ) {
    // Register icons (if using a version that requires manual registry, otherwise the module import is enough for standalone if icons are provided in providers or imports)
    // For lucide-angular 0.553.0 with standalone components, we usually import the icons directly in the imports array or use a provider.
    // Let's check how it was done in other components or just add them to the imports array which is the standard way for standalone.
    
    this.loadHotels();
    this.ensureBookingId();
    this.loadPassengerData();
    this.checkBookingStatus();
    
    // Initialize countries
    this.countries = this.countriesService.getCountries();
    // Default to Egypt
    this.selectedPhoneCountry = this.countriesService.getCountryByCode('EG') || null;

    // If local draft is missing, try load pending pieces from server
    this.loadPendingFromServerIfMissing();
  }

  ngOnDestroy(): void {
    this.cleanupStripe();
  }

  // ---------------- Hotel & Transport Status ----------------
  private loadHotels() {
    this.hotelApi.getHotels().subscribe({
      next: (data) => (this.hotels = data),
      error: (err) => console.error('Error loading hotels', err),
    });
  }

  private async loadPendingFromServerIfMissing() {
    try {
      const current = this.auth.getBookingData() || {};
      const hasLocal = !!(current.makkahHotelData || current.madinahHotelData || current.transportData || current.groundData);
      if (hasLocal) return; // nothing to fetch

      // Fetch pending pieces in parallel
      const [hotels, grounds, internationals] = await Promise.all([
        firstValueFrom(this.bookingsService.getMyPendingHotelBookings()),
        firstValueFrom(this.bookingsService.getMyPendingGroundBookings()),
        firstValueFrom(this.bookingsService.getMyPendingTransportBookings())
      ]);

      const draft: any = { ...(current || {}) };

      // Map server results into local draft shape. Take latest entries if arrays returned.
      if (hotels && hotels.length) {
        const last = hotels[hotels.length - 1];
        // support server naming variations
        draft.makkahHotelData = last.city === 'Makkah' || last.city === 'مكة' ? last : draft.makkahHotelData;
        draft.madinahHotelData = last.city === 'Madinah' || last.city === 'المدينة' ? last : draft.madinahHotelData;
      }

      if (grounds && grounds.length) {
        draft.groundData = grounds[grounds.length - 1];
      }

      if (internationals && internationals.length) {
        draft.transportData = internationals[internationals.length - 1];
      }

      // Save to local storage for fast access
      this.auth.saveBookingData(draft);

      // Re-evaluate status
      this.checkBookingStatus();
    } catch (err) {
      // non-fatal
      console.warn('Failed to load pending drafts from server', err);
    }
  }

  private checkBookingStatus() {
    const snapshot = this.getBookingSnapshotFromStorage();

    // Hotel status messages
    const makkahBooked = !!snapshot.makkahHotel;
    const madinahBooked = !!snapshot.madinahHotel;

    this.hotelBookedMessage =
      makkahBooked && madinahBooked
        ? '✔ تم حجز الفنادق (مكة والمدينة) بنجاح'
        : makkahBooked
          ? '✔ تم حجز فندق مكة بنجاح'
          : madinahBooked
            ? '✔ تم حجز فندق المدينة بنجاح'
            : '';

    // Transport status messages
    this.transportBookedMessage = snapshot.internationalTransport
      ? '✔ تم حجز الطيران/البحري بنجاح'
      : '';
    this.groundBookedMessage = snapshot.groundTransport ? '✔ تم حجز النقل البري بنجاح' : '';

    // Calculate total
    if (
      snapshot.makkahHotel &&
      snapshot.madinahHotel &&
      snapshot.internationalTransport &&
      snapshot.groundTransport
    ) {
      this.totalAmount = this.calculateTotalAmount(snapshot);
    }
  }

  // ---------------- Booking Actions ----------------
  chooseTrip(type: 'umrah' | 'hajj') {
    this.selectedTripType = type;
  }

  goToHotelsPage(city?: 'Makkah' | 'Madinah') {
    this.router.navigate(['/hotels'], { queryParams: city ? { city } : {} });
  }

  goToTransportPage(tab: 'international' | 'ground' = 'international') {
    this.router.navigate(['/transport'], { queryParams: { tab } });
  }

  // ---------------- Stripe Payment ----------------
  async finalizeBooking() {
    const snapshot = this.getBookingSnapshot();
    if (!snapshot) return;
    if (!this.isPassengerInfoValid()) return;

    this.totalAmount = this.calculateTotalAmount(snapshot);
    if (this.totalAmount <= 0) {
      this.toastr.error('لا يمكن المتابعة بدون إجمالي تكلفة صالح.', 'خطأ');
      return;
    }

    // Validate Passport Expiry (Must be > 6 months from travel start)
    const travelStartDate = new Date(snapshot.makkahHotel?.checkInDate || new Date());
    const sixMonthsFromTravel = new Date(travelStartDate);
    sixMonthsFromTravel.setMonth(sixMonthsFromTravel.getMonth() + 6);

    if (this.passenger.passportExpiry) {
      const passportExpiry = new Date(this.passenger.passportExpiry);
      if (passportExpiry < sixMonthsFromTravel) {
        this.toastr.error('Passport expiry date must be more than 6 months from the travel date.', 'Error');
        return;
      }
    }

    this.isFinalizing = true;

    try {
      // Create booking and get id
      const savedBookingId = await this.saveBooking(snapshot);

      console.log('🎯 Booking saved with ID:', savedBookingId);

      if (!savedBookingId) {
        throw new Error('No booking ID returned from server');
      }

      this.bookingId = Number(savedBookingId);

      // If stripe, initiate payment UI
      if (this.paymentMethod === 'stripe') {
        await this.initStripePayment();
        // Do not navigate — user should finish payment on this page
      } else {
        // Non-card: navigate to confirmation
        await this.router.navigate(['/booking-confirmation', savedBookingId]);
      }

      this.isFinalizing = false;
    } catch (err) {
      console.error('❌ Finalize booking error', err);
      this.toastr.error('فشل في حفظ الحجز. الرجاء المحاولة مرة أخرى.', 'خطأ');
      this.isFinalizing = false;
    }
  }

  private async saveBooking(snapshot: BookingSnapshot): Promise<number | string> {
  const makkahCheckIn = snapshot.makkahHotel?.checkInDate;
  const madinahCheckOut = snapshot.madinahHotel?.checkOutDate;

  // ✅ Clean payload - only send what backend needs for CREATE
  const payload: CreateBookingRequest = {
    type: this.selectedTripType === 'umrah' ? TripType.Umrah : TripType.Hajj,
    travelStartDate: makkahCheckIn || new Date().toISOString(),
    travelEndDate: madinahCheckOut || new Date().toISOString(),
    numberOfTravelers: 1,
    
    // ✅ Only send essential hotel data (not bookingId or bookingHotelId)
    makkahHotel: {
      hotelId: snapshot.makkahHotel?.hotelId,
      roomId: snapshot.makkahHotel?.roomId,
      city: 'Makkah', // ✅ Required by backend HotelBookingDto
      checkInDate: snapshot.makkahHotel?.checkInDate,
      checkOutDate: snapshot.makkahHotel?.checkOutDate,
      numberOfRooms: snapshot.makkahHotel?.numberOfRooms || 1,
      totalPrice: snapshot.makkahHotel?.totalPrice
    },
    
    madinahHotel: {
      hotelId: snapshot.madinahHotel?.hotelId,
      roomId: snapshot.madinahHotel?.roomId,
      city: 'Madinah', // ✅ Required by backend HotelBookingDto
      checkInDate: snapshot.madinahHotel?.checkInDate,
      checkOutDate: snapshot.madinahHotel?.checkOutDate,
      numberOfRooms: snapshot.madinahHotel?.numberOfRooms || 1,
      totalPrice: snapshot.madinahHotel?.totalPrice
    },
    
    // ✅ Only send transportId and numberOfSeats
    internationalTransport: {
      transportId: snapshot.internationalTransport?.transportId,
      numberOfSeats: snapshot.internationalTransport?.numberOfSeats,
      totalPrice: snapshot.internationalTransport?.totalPrice
    },
    
    // ✅ Send all required ground transport fields
    groundTransport: {
      groundTransportId: snapshot.groundTransport?.groundTransportId,
      serviceDate: snapshot.groundTransport?.serviceDate || new Date().toISOString(),
      pickupLocation: snapshot.groundTransport?.pickupLocation,
      dropoffLocation: snapshot.groundTransport?.dropoffLocation,
      numberOfPassengers: snapshot.groundTransport?.numberOfPassengers || 1,
      totalPrice: snapshot.groundTransport?.totalPrice
    },
    
    travelers: [
      {
        firstName: this.passenger.firstName,
        lastName: this.passenger.lastName,
        dateOfBirth: this.passenger.dateOfBirth,
        passportNumber: this.passenger.passport,
        passportExpiryDate: this.passenger.passportExpiry,
        passportIssuingCountry: this.passenger.passportIssuingCountry,
        nationality: this.passenger.nationality,
        gender: this.passenger.gender,
        phoneNumber: `${this.selectedPhoneCountry?.dialCode || ''}${this.passenger.phone}`,
        email: this.passenger.email,
        isMainTraveler: true,
      },
    ],
    
    totalPrice: this.totalAmount,
  };

  console.log('📤 Clean Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await firstValueFrom(this.bookingsService.createBooking(payload));
    console.log('✅ Response:', response);

    this.toastr.success('تم إنشاء الحجز بنجاح!', 'نجاح');

    // Extract ID
    const bookingId = (response as any).data?.id || (response as any).data?.bookingId || (response as any).id;

    if (!bookingId) {
      throw new Error('Booking ID not found in response');
    }

    this.auth.clearUserBookingData();
    return bookingId;
  } catch (error: any) {
    console.error('❌ Error:', error);
    console.error('❌ Error Response:', error?.error);
    
    const errorMsg = error?.error?.message || error?.error?.title || 'فشل إنشاء الحجز';
    this.toastr.error(errorMsg, 'خطأ');
    throw error;
  }
}
  private async initStripePayment() {
    this.paymentError = '';

    try {
      const payload: CreatePaymentRequest = {
        bookingId: this.bookingId,
        currency: (this.stripeConfig?.currency || 'usd').toLowerCase(),
        idempotencyKey: `booking-${this.bookingId}-${Date.now()}`,
      };

      const response = await firstValueFrom(this.paymentService.createPayment(payload));

      if (!response.clientSecret) {
        throw new Error('لم نستلم client secret من Stripe.');
      }

      this.clientSecret = response.clientSecret;
      this.mountStripeCard();

      this.toastr.info('برجاء إدخال بيانات البطاقة لإتمام الدفع.', 'Stripe');
    } catch (error: any) {
      console.error('Stripe init error', error);

      if (error.status === 404) {
        this.toastr.error('نقطة نهاية الدفع غير موجودة. يرجى الاتصال بالدعم.', 'خطأ');
      } else {
        const errorMsg = error?.error?.message || 'فشل تهيئة الدفع. الرجاء المحاولة مرة أخرى.';
        this.toastr.error(errorMsg, 'خطأ');
      }
      throw error;
    } finally {
      this.isFinalizing = false;
    }
  }

  async confirmStripePayment() {
    if (!this.stripe || !this.cardElement || !this.clientSecret) return;

    this.isPaymentProcessing = true;
    this.paymentError = '';

    const billingName = `${this.passenger.firstName} ${this.passenger.lastName}`.trim();

    try {
      const result = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: billingName || undefined,
            email: this.passenger.email || undefined,
            phone: this.passenger.phone || undefined,
          },
        },
      });

      if (result.error) {
        this.paymentError = result.error.message || 'فشل الدفع.';
        this.toastr.error(this.paymentError, 'Stripe');
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        this.paymentSuccess = 'تم الدفع بنجاح!';
        this.toastr.success(this.paymentSuccess, 'Stripe');
        this.clearBookingCache();
        // Navigate to confirmation with booking id and payment intent
        this.router.navigate(['/booking-confirmation', this.bookingId], {
          queryParams: {
            paymentIntentId: result.paymentIntent.id,
          },
        });
      }
    } catch (err) {
      console.error('Stripe confirmation error', err);
      this.paymentError = err instanceof Error ? err.message : 'حدث خطأ أثناء الدفع.';
      this.toastr.error(this.paymentError, 'Stripe');
    } finally {
      this.isPaymentProcessing = false;
    }
  }

  // ---------------- Utilities ----------------
  private ensureBookingId() {
    const userData = this.auth.getBookingData();
    if (userData?.bookingId) {
      this.bookingId = userData.bookingId;
    } else {
      // If no booking ID exists in the user data, generate one and save it
      this.bookingId = Math.floor(Math.random() * 1000000);
      this.auth.saveBookingData({
        ...userData,
        bookingId: this.bookingId,
      });
    }
  }

  private getBookingSnapshotFromStorage(): BookingSnapshot {
    const userData = this.auth.getBookingData() || {};
    return {
      makkahHotel: userData.makkahHotelData || null,
      madinahHotel: userData.madinahHotelData || null,
      internationalTransport: userData.transportData || null,
      groundTransport: userData.groundData || null,
    };
  }

  private getBookingSnapshot(): BookingSnapshot | null {
    const snapshot = this.getBookingSnapshotFromStorage();

    if (!snapshot.makkahHotel || !snapshot.madinahHotel) {
      this.toastr.warning('يجب حجز فندق في مكة وآخر في المدينة قبل المتابعة.', 'الفنادق مطلوبة');
      return null;
    }

    if (!snapshot.internationalTransport || !snapshot.groundTransport) {
      this.toastr.warning('يجب إكمال حجز النقل الدولي والنقل البري.', 'النقل مطلوب');
      return null;
    }

    return snapshot;
  }

  private calculateTotalAmount(data: BookingSnapshot): number {
    const hotelTotals =
      this.coerceAmount(data.makkahHotel?.totalPrice) + this.coerceAmount(data.madinahHotel?.totalPrice);
    const transportTotals =
      this.coerceAmount(data.internationalTransport?.totalPrice) + this.coerceAmount(data.groundTransport?.totalPrice);
    return hotelTotals + transportTotals;
  }

  private coerceAmount(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private loadPassengerData() {
    const userData = this.auth.getBookingData();
    if (userData?.passengerData) {
      this.passenger = userData.passengerData;
    }
  }

  savePassengerData() {
    const current = this.auth.getBookingData() || {};
    this.auth.saveBookingData({
      ...current,
      passengerData: this.passenger,
    });
    
  }

  private async ensureStripeInstance() {
    if (this.stripe) return;
    if (!this.stripeConfig?.publishableKey) {
      throw new Error('Stripe publishable key is missing.');
    }
    this.stripe = await loadStripe(this.stripeConfig.publishableKey);
    if (!this.stripe) throw new Error('تعذر تحميل Stripe.');
  }

  private async mountStripeCard() {
    if (!this.cardElementHost) return;

    await this.ensureStripeInstance();
    if (!this.stripe) return;

    if (this.cardElement) this.cardElement.destroy();

    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', { hidePostalCode: true });
    this.cardElement.mount(this.cardElementHost.nativeElement);
  }

  private cleanupStripe() {
    this.cardElement?.destroy();
    this.cardElement = undefined;
    this.elements = null;
    this.stripe = null;
  }

  private clearBookingCache() {
    this.auth.clearUserBookingData();
  }

  private isPassengerInfoValid(): boolean {
    if (!this.passenger.firstName || !this.passenger.lastName || !this.passenger.email || !this.passenger.phone) {
      this.toastr.warning('يرجى إكمال بيانات المسافر الأساسية.', 'بيانات ناقصة');
      return false;
    }
    return true;
  }
}

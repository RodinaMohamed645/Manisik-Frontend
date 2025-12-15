import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingsService } from './bookings.service';
import { environment } from '../../../environments/environment';
import { Booking } from '../../interfaces';
import { AuthService } from './auth.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let httpMock: HttpTestingController;
  const mockAuth = {
    getCurrentUserValue: () => ({ id: 'user123' })
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookingsService,
        { provide: AuthService, useValue: mockAuth }
      ]
    });

    service = TestBed.inject(BookingsService);
    httpMock = TestBed.inject(HttpTestingController);

    try { localStorage.clear(); } catch {}
  });

  afterEach(() => {
    httpMock.verify();
    try { localStorage.clear(); } catch {}
  });

  it('should emit cached value then network refreshed value from getMyBookingsWithCache', (done) => {
    const cached: Booking[] = [
      { id: 'b1', userId: 'u1', type: 'hotel', totalPrice: 100, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ] as any;

    localStorage.setItem('user_bookings_user123', JSON.stringify(cached));

    const networkBooking: Booking = { id: 'b2', userId: 'u1', type: 'hotel', totalPrice: 200, status: 'confirmed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any;

    const emissions: Booking[][] = [];

    service.getMyBookingsWithCache().subscribe({
      next: (value) => { emissions.push(value); },
      error: (err) => fail(err),
      complete: () => {}
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Booking/MyBookings`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [networkBooking] });

    setTimeout(() => {
      try {
        expect(emissions.length).toBe(2);
        expect(emissions[0]).toEqual(cached);
        expect(emissions[1]).toEqual([networkBooking]);
        done();
      } catch (e) {
        done.fail(e as any);
      }
    }, 0);
  });

  it('should call getAllBookings and return array', (done) => {
    const mockBookings = [
      { id: 1, type: 'Hajj', status: 'Confirmed', totalPrice: 500 },
      { id: 2, type: 'Umrah', status: 'Pending', totalPrice: 300 }
    ];

    service.getAllBookings().subscribe({
      next: (bookings) => {
        expect(bookings.length).toBe(2);
        expect(bookings[0].id).toBe(1);
        expect(bookings[1].type).toBe('Umrah');
        done();
      },
      error: (err) => done.fail(err)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Booking/AllBookings`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockBookings });
  });

  it('should call getBookingById and return single booking', (done) => {
    const mockBooking = { id: 123, type: 'Hajj', status: 'Paid', totalPrice: 1000 };

    service.getBookingById('123').subscribe({
      next: (booking) => {
        expect(booking.id).toBe(123);
        expect(booking.type).toBe('Hajj');
        done();
      },
      error: (err) => done.fail(err)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Booking/GetBooking/123`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockBooking });
  });

  it('should handle empty bookings array', (done) => {
    service.getAllBookings().subscribe({
      next: (bookings) => {
        expect(bookings.length).toBe(0);
        expect(Array.isArray(bookings)).toBe(true);
        done();
      },
      error: (err) => done.fail(err)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Booking/AllBookings`);
    req.flush({ success: true, data: [] });
  });
});


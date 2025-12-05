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

    // Because BookingsService uses inject(AuthService) internally, Angular will resolve the provided AuthService token.
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
      next: (value) => {
        emissions.push(value);
      },
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
        // Check localStorage was updated
        const stored = JSON.parse(localStorage.getItem('user_bookings_user123') || '[]');
        expect(stored.length).toBe(1);
        expect(stored[0].id).toBe('b2');
        done();
      } catch (e) {
        done.fail(e as any);
      }
    }, 0);
  });
});

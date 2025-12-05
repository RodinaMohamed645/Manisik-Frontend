import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, HotelBookingDto } from 'src/app/models/api';

@Injectable({
  providedIn: 'root',
})
export class BookingHotelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  bookHotel(booking: HotelBookingDto): Observable<ApiResponse<HotelBookingDto>> {
    return this.http.post<ApiResponse<HotelBookingDto>>(`${this.apiUrl}/HotelBooking/BookHotel`, booking, { withCredentials: true });
  }
}

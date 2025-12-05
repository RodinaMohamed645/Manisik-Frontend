import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, TransportBookingDto } from 'src/app/models/api';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingTransportService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  bookTransport(dto: TransportBookingDto): Observable<ApiResponse<TransportBookingDto>> {
    return this.http.post<ApiResponse<TransportBookingDto>>(
      `${this.apiUrl}/InternationalTransportBooking/BookInternationalTransport`,
      dto,
      { withCredentials: true }
    );
  }


}

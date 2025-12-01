import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, InternationalTransportBooking } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingTransportService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  bookTransport(dto: InternationalTransportBooking): Observable<ApiResponse<InternationalTransportBooking>> {
    return this.http.post<ApiResponse<InternationalTransportBooking>>(
      `${this.apiUrl}/InternationalTransportBooking/BookInternationalTransport`,
      dto
    );
  }

  getUserTransportBookings(): Observable<ApiResponse<InternationalTransportBooking[]>> {
    return this.http.get<ApiResponse<InternationalTransportBooking[]>>(
      `${this.apiUrl}/InternationalTransportBooking/GetUserBookings`
    );
  }
}

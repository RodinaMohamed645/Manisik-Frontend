import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, GroundTransportBookingDto } from 'src/app/models/api';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingGroundService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  bookGround(dto: GroundTransportBookingDto): Observable<ApiResponse<GroundTransportBookingDto>> {
    return this.http.post<ApiResponse<GroundTransportBookingDto>>(
      `${this.apiUrl}/GroundTransportBooking/BookGroundTransport`,
      dto,
      { withCredentials: true }
    );
  }


}

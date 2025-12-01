import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, GroundTransportBooking } from 'src/app/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingGroundService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  bookGround(dto: GroundTransportBooking): Observable<ApiResponse<GroundTransportBooking>> {
    return this.http.post<ApiResponse<GroundTransportBooking>>(
      `${this.apiUrl}/GroundTransportBooking/BookGroundTransport`,
      dto
    );
  }

  getUserGroundBookings(): Observable<ApiResponse<GroundTransportBooking[]>> {
    return this.http.get<ApiResponse<GroundTransportBooking[]>>(
      `${this.apiUrl}/GroundTransportBooking/GetUserBookings`
    );
  }
}

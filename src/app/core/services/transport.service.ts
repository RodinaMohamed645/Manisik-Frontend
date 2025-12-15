import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransportOption, TransportSearchParams,ApiResponse, GroundTransport } from '../../interfaces';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private readonly http = inject(HttpClient);
  private readonly cacheService = inject(CacheService);
  private readonly apiUrl = environment.apiUrl;

  // Cache TTL: 3 minutes for transport listings
  private readonly TRANSPORT_TTL = 3 * 60 * 1000;

  getAllInternationalTransports(): Observable<{ success: boolean; message: string; data: any[] }> {
    return this.cacheService.getOrFetch(
      'transports:international',
      () => this.http.get<{ success: boolean; message: string; data: any[] }>(`${this.apiUrl}/InternationalTransport/GetAllTransports`),
      this.TRANSPORT_TTL
    );
  }

  getAllGroundTransports(): Observable<{ success: boolean; message: string; data: any[] }> {
    return this.cacheService.getOrFetch(
      'transports:ground',
      () => this.http.get<{ success: boolean; message: string; data: any[] }>(`${this.apiUrl}/GroundTransport/GetAllGroundTransports`),
      this.TRANSPORT_TTL
    );
  }

  // From remote: used by BookingInternationalTransportComponent
  getTransportOptions(): Observable<ApiResponse<TransportOption[]>> {
    return this.http.get<ApiResponse<TransportOption[]>>(`${this.apiUrl}/InternationalTransport/GetAllTransports`);
  }

 searchByRoute(departure: string, arrival: string): Observable<ApiResponse<TransportOption[]>> {
  const params = new HttpParams()
    .set('departureAirport', departure)
    .set('arrivalAirport', arrival);

  return this.http.get<ApiResponse<TransportOption[]>>(
    `${this.apiUrl}/InternationalTransport/SearchByRoute`,
    { params }
  );
}
  searchByDateRange(startDate: string, endDate: string): Observable<ApiResponse<TransportOption[]>> {
      // Normalize date inputs: if the frontend provides a date-only string (yyyy-MM-dd)
      // append a time portion so the backend receives a DateTime like 2025-12-24T00:00:00
      const normalize = (d?: string) => {
        if (!d) return '';
        // if already contains time (T) assume full ISO; otherwise append T00:00:00
        return d.includes('T') ? d : `${d}T00:00:00`;
      };

      const params = new HttpParams()
        .set('startDate', normalize(startDate))
        .set('returnDate', normalize(endDate));
      return this.http.get<ApiResponse<TransportOption[]>>(
    `${this.apiUrl}/InternationalTransport/SearchByDateRange`,
    { params }
  );
  }
  getTransportOptionById(id: string): Observable<TransportOption> {
    return this.http.get<TransportOption>(`${this.apiUrl}/transport/${id}`);
  }

  getInternationalById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/InternationalTransport/GetTransportById/${id}`);
  }

  getGroundById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GroundTransport/GetGroundTransportById/${id}`);
  }

  // method for ground transport (from remote)
  getTransportsByType(Type: string): Observable<ApiResponse<GroundTransport[]>> {
    const params = new HttpParams().set('transportType', Type);
    return this.http.get<ApiResponse<GroundTransport[]>>(`${this.apiUrl}/GroundTransport/SearchByType`, { params });
  }

  // edit Intternational Transport
  // /api/InternationalTransport/UpdateTransport/{id}
  
updateInternationalTransport(id: number, transportData: any): Observable<any> {
  const url = `${environment.apiUrl}/InternationalTransport/UpdateTransport/${id}`;

  return this.http.put<any>(url, transportData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Create International Transport
// /api/InternationalTransport/CreateTransport
createInternationalTransport(transportData: any): Observable<any> {
  const url = `${environment.apiUrl}/InternationalTransport/CreateTransport`;

  return this.http.post<any>(url, transportData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

  
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Hotel, HotelSearchParams, Room } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class HotelsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly apiUrlForImages = environment.apiUrlForImages;
  getHotels(params?: HotelSearchParams): Observable<Hotel[]> {
    let httpParams = new HttpParams();

    if (params?.city) {
      httpParams = httpParams.set('city', params.city);
    }

    if (params?.sortBy) {
      let filterValue = '';
      switch (params.sortBy) {
        case 'pricelowtohigh':
          filterValue = 'pricelowtohigh';
          break;
        case 'pricehightolow':
          filterValue = 'pricehightolow';
          break;
        case 'distance':
          filterValue = 'distance';
          break;
        case 'rating':
          filterValue = 'rating';
        //break;
      }
      httpParams = httpParams.set('filter', filterValue);
    }

    return this.http.get<Hotel[]>(`${this.apiUrl}/Hotel/getallFiltered`, {
      params: httpParams,
    });
  }
  getImageUrl(hotel: Hotel): string {
    return hotel.imageUrl.startsWith('http')
      ? hotel.imageUrl
      : `${this.apiUrlForImages}${hotel.imageUrl}`;
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/hotels/${id}`);
  }

  getRooms(hotelId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/hotels/${hotelId}/rooms`);
  }

  getRoomById(hotelId: string, roomId: string): Observable<Room> {
    return this.http.get<Room>(
      `${this.apiUrl}/hotels/${hotelId}/rooms/${roomId}`
    );
  }
}
// getHotels(params?: HotelSearchParams): Observable<Hotel[]> {
//   let httpParams = new HttpParams();
//   if (params) {
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         if (Array.isArray(value)) {
//           value.forEach(
//             (v) => (httpParams = httpParams.append(key, v.toString()))
//           );
//         } else {
//           httpParams = httpParams.set(key, value.toString());
//         }
//       }
//     });
//   }
//   return this.http.get<Hotel[]>(`${this.apiUrl}/Hotel/`, {
//     params: httpParams,
//   });
// }

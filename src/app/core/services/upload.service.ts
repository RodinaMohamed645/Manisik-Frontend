import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
    isSuccess: boolean;
    data: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private apiUrl = `${environment.apiUrl}/Upload`;

    constructor(private http: HttpClient) { }

    /**
     * Upload a traveler photo
     * @param file The image file to upload
     * @returns Observable with the URL of the uploaded photo
     */
    uploadTravelerPhoto(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<UploadResponse>(`${this.apiUrl}/traveler-photo`, formData)
            .pipe(
                map(response => response.data)
            );
    }
}

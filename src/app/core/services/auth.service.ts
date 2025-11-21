import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response.data);
        this.fetchAndSetUser();
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, data).pipe(
      tap(response => {
        this.setAuthData(response.data);
        this.fetchAndSetUser();
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/Auth/logout`, {}).subscribe({
      next: () => this.clearAuthData(),
      error: () => this.clearAuthData()
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/Auth/me`).pipe(
      map(response => response.data)
    );
  }

  private fetchAndSetUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.clearAuthData()
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getRole(): UserRole | null {
    const user = this.getCurrentUserValue();
    return user ? user.role : null;
  }

  setAuthData(data: { token: string; refreshToken: string | null }): void {
    localStorage.setItem('token', data.token);
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.apiUrl}/Auth/RefreshToken`,
      {}
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  private loadUserFromToken(): void {
    if (this.getToken()) {
      this.fetchAndSetUser();
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}

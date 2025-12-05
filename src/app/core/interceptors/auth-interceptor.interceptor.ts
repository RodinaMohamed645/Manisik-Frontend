import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Auth Interceptor for Cookie-Based Authentication
 * 
 * With httpOnly cookies, we don't need to add Authorization header manually
 * Browser automatically includes cookies in requests
 * 
 * This interceptor:
 * 1. Adds withCredentials to all API requests
 * 2. Adds Authorization header fallback if token stored in localStorage
 * 3. Handles 401 errors by redirecting to login
 */
export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const apiUrl = environment.apiUrl;

  let modifiedReq = req;

  // For requests to our API, ensure cookies are included
  if (req.url.startsWith(apiUrl)) {
    // ensure withCredentials
    const headers: Record<string, string> = {};

    // Authorization header fallback - read token from localStorage if present
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore storage errors
    }

    modifiedReq = req.clone({
      withCredentials: true,
      setHeaders: headers
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: any) => {
      // Handle 401 Unauthorized - session expired or invalid
      if (error?.status === 401) {
        // Skip redirect for login and register endpoints
        const isAuthEndpoint = req.url.includes('/Auth/Login') || 
                               req.url.includes('/Auth/Register') ||
                               req.url.includes('/Auth/Logout');
        
        if (!isAuthEndpoint) {
          // Session expired - redirect to login
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }

      return throwError(() => error);
    })
  );
};

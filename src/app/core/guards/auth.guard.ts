import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

/**
 * Auth Guard for protecting routes
 * Works with httpOnly cookie authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is already loaded in memory, allow immediately
  const currentUser = authService.getCurrentUserValue();
  if (currentUser) {
    return true;
  }

  // User not in memory - check with backend via /Auth/Me
  // This verifies the httpOnly cookie is valid
  return authService.checkAuth().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      
      // No valid session - redirect to login
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    })
  );
};

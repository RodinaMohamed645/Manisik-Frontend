import { Routes } from '@angular/router';


export const routes: Routes = [

    {path: '', loadComponent: () => import('./Components/home/home.component').then(m => m.HomeComponent)},
    {path: 'packages', loadComponent: () => import('./Components/booking-package/booking-package.component').then(m => m.BookingPackageComponent)},
    {path: 'hotels', loadComponent: () => import('./Components/hotel/hotel.component').then(m => m.HotelComponent)},
    {path: 'transport', loadComponent: () => import('./Components/transport/transport.component').then(m => m.TransportComponent)},
    {path: 'signIn', loadComponent: () => import('./Components/sign-in/sign-in.component').then(m => m.SignInComponent)},
    {path: 'login', loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent)},
    {path: 'dashboard', loadComponent: () => import('./Components/dashboard/dashboard.component').then(m => m.DashboardComponent)},
    {path: '**', redirectTo: ''}
    

];

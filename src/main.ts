import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  LucideAngularModule,
  Globe,
  Home,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  User,
  X,
  Users,
  Building2,
  Headphones,
  Star,
  Clock,
  MapPin,
  Check,
  CheckCircle,
  Mail,
  Shield,
  ChevronDown,
  Package,
  Bus,
  Settings,
  CreditCard,
  TrendingUp,
} from 'lucide-angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes'; // define your routes in a separate file


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu,
        Search,
        Globe,
        Moon,
        ShoppingCart,
        User,
        Home,
        X,
        Users,
        Building2,
        Headphones,
        Star,
        Clock,
        MapPin,
        Check,
        CheckCircle,
        Mail,
        Shield,
        ChevronDown,
        Package,
        Bus,
        Settings,
        CreditCard,
        TrendingUp,
      }),
    ),
    provideHttpClient(),
  ]
})
  .catch((err) => console.error(err));

import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptorInterceptor } from './core/interceptors/auth-interceptor.interceptor';
import { 
  LucideAngularModule, 
  AlertCircle, Bed, Building, Building2, Bus, Calendar, Check, CheckCircle, ChevronDown, Clock, CreditCard, Edit, FileText, Flag, Globe, Lock, Mail, MapPin, Navigation, Plane, Plus, Receipt, RefreshCw, ShieldCheck, Star, Trash2, User, Users, XCircle, X
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(NoPreloading)),
    provideHttpClient(withInterceptors([authInterceptorInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({
      AlertCircle, Bed, Building, Building2, Bus, Calendar, Check, CheckCircle, ChevronDown, Clock, CreditCard, Edit, FileText, Flag, Globe, Lock, Mail, MapPin, Navigation, Plane, Plus, Receipt, RefreshCw, ShieldCheck, Star, Trash2, User, Users, XCircle, X
    }))]
    
};

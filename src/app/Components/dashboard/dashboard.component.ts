import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from 'src/app/core/services/i18n.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BookingsService } from 'src/app/core/services/bookings.service';
import { ToastrService } from 'ngx-toastr';
import { BookingDto } from 'src/app/models/api';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  roles: string[];
  isActive: boolean;
  fullName: string;
}

interface AssignRoleDto {
  userId: number;
  roleName: string;
}

interface HotelDto {
  id?: number;
  name: string;
  description?: string;
  descriptionAr?: string;
  address: string;
  city: string;
  rating?: number;
  pricePerNight: number;
  availableRooms: number;
  amenities?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  userId?: number;
  starRating?: number;
  distanceToHaram?: number;
  imageUrl?: string;
}

interface InternationalTransportDto {
  id?: number;
  internationalTransportType: string;
  carrierName: string;
  departureAirport: string;
  departureAirportCode?: string;
  arrivalAirport: string;
  arrivalAirportCode?: string;
  departureDate: string;
  arrivalDate: string;
  price: number;
  totalSeats?: number;
  availableSeats: number;
  flightNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  createdByUserId?: number;
}

interface GroundTransportDto {
  id?: number;
  serviceName: string;
  serviceNameAr?: string;
  type: number; // 0 = PrivateCar, 1 = SharedBus, 2 = Taxi
  pricePerPerson: number;
  description?: string;
  descriptionAr?: string;
  capacity: number;
  isActive?: boolean;
  createdAt?: string;
}

import { 
  LucideAngularModule, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  Building2, 
  MapPin, 
  Star, 
  Navigation, 
  Bed, 
  Mail, 
  Plus, 
  Trash2, 
  Edit, 
  Plane, 
  Bus, 
  Building, 
  AlertCircle 
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly i18n = inject(I18nService);
  readonly auth = inject(AuthService);
  readonly bookings = inject(BookingsService);
  readonly toastr = inject(ToastrService);
  readonly http = inject(HttpClient);
  readonly router = inject(Router);
   hotel : HotelDto = 
   {
    name: '',
    description: '',
    address: '',
    city: 'Makkah',
    rating: 3,
    pricePerNight: 0,
    availableRooms: 0,
    amenities: '',
    latitude: 0,
    longitude: 0,
    isActive: true,
    userId: 0,
    starRating: 3,
    distanceToHaram: 0,
    imageUrl: ''
   };
  currentUser = signal<any>(null);
  role = signal<string | null>(null);
  activeView = signal<'overview' | 'bookings' | 'users' | 'hotels' | 'international-transport' | 'ground-transport'>('overview');
  
  loading = signal<boolean>(false);
  usersLoading = signal<boolean>(false);
  bookingsLoading = signal<boolean>(false);
  
  allBookings = signal<BookingDto[]>([]);
  myBookings = signal<BookingDto[]>([]);
  allUsers = signal<UserDto[]>([]);
  usersByRole = signal<UserDto[]>([]);
  
  bookingStatusFilter = signal<string>('all');
  userRoleFilter = signal<string>('all');
  searchQuery = signal<string>('');
  
  selectedUser = signal<UserDto | null>(null);
  roleToAssign = signal<string>('User');
  showRoleModal = signal<boolean>(false);

  // Hotel management
  allHotels = signal<HotelDto[]>([]);
  myHotels = signal<HotelDto[]>([]);
  hotelsLoading = signal<boolean>(false);
  selectedHotel = signal<HotelDto | null>(null);
  showHotelModal = signal<boolean>(false);
  
  // NEW: user menu state for header dropdown
  showUserMenu = signal<boolean>(false);

  // Use plain object for form data to avoid signal mutation issues with ngModel
  hotelFormData: HotelDto = {
    name: '',
    address: '',
    city: 'Makkah',
    pricePerNight: 0,
    availableRooms: 0,
    starRating: 3,
    distanceToHaram: 0,
    description: '',
    descriptionAr: '',
    amenities: ''
  };
  selectedFile: File | null = null;
  
  // International Transport management
  allInternationalTransports = signal<InternationalTransportDto[]>([]);
  internationalTransportsLoading = signal<boolean>(false);
  selectedInternationalTransport = signal<InternationalTransportDto | null>(null);
  showInternationalTransportModal = signal<boolean>(false);
  
  internationalTransportFormData: InternationalTransportDto = {
    carrierName: '',
    internationalTransportType: 'Flight',
    departureAirport: '',
    departureAirportCode: '',
    arrivalAirport: '',
    arrivalAirportCode: '',
    departureDate: '',
    arrivalDate: '',
    price: 0,
    totalSeats: 0,
    availableSeats: 0,
    flightNumber: '',
    isActive: true
  };
  
  // Ground Transport management
  allGroundTransports = signal<GroundTransportDto[]>([]);
  groundTransportsLoading = signal<boolean>(false);
  selectedGroundTransport = signal<GroundTransportDto | null>(null);
  showGroundTransportModal = signal<boolean>(false);
  
  groundTransportFormData: GroundTransportDto = {
    serviceName: '',
    serviceNameAr: '',
    type: 0,
    pricePerPerson: 0,
    description: '',
    descriptionAr: '',
    capacity: 0,
    isActive: true
  };

  stats = computed(() => {
    const bookings = this.role() === 'Admin' ? this.allBookings() : this.myBookings();
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    
    return {
      total: bookings.length,
      confirmed,
      pending,
      cancelled,
      users: this.allUsers().length,
      hotels: this.allHotels().length,
      internationalTransports: this.allInternationalTransports().length,
      groundTransports: this.allGroundTransports().length
    };
  });

  upcomingTrips = computed(() => {
    const bookings = this.role() === 'Admin' ? this.allBookings() : this.myBookings();
    const upcoming = bookings
      .filter(b => b.status === 'Confirmed')
      .map(b => ({
        type: this.getBookingType(b),
        destination: 'Makkah & Madinah',
        hotel: 'N/A',
        status: b.status || 'Unknown',
        daysLeft: this.calculateDaysLeft(b.createdAt)
      }));
    return upcoming.slice(0, 3); // Show max 3 upcoming trips
  });

  recentActivity = computed(() => {
    const bookings = this.role() === 'Admin' ? this.allBookings() : this.myBookings();
    const activities = bookings
      .slice(0, 5)
      .map(b => ({
        action: b.status === 'Confirmed' ? 'Confirmed' : b.status === 'Pending' ? 'Pending' : 'Cancelled',
        item: `Booking #${b.id}`,
        time: this.getTimeAgo(b.createdAt)
      }));
    return activities;
  });

  filteredBookings = computed(() => {
    let bookings = this.role() === 'Admin' ? this.allBookings() : this.myBookings();
    
    if (this.bookingStatusFilter() !== 'all') {
      bookings = bookings.filter(b => b.status === this.bookingStatusFilter());
    }
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      bookings = bookings.filter(b => 
        b.id?.toString().includes(query) ||
        b.status?.toLowerCase().includes(query)
      );
    }
    
    return bookings;
  });

  filteredUsers = computed(() => {
    let users = this.allUsers();
    
    if (this.userRoleFilter() !== 'all') {
      users = users.filter(u => u.roles.includes(this.userRoleFilter()));
    }
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      users = users.filter(u => 
        u.email.toLowerCase().includes(query) ||
        u.fullName.toLowerCase().includes(query)
      );
    }
    
    return users;
  });

  displayedHotels = computed(() => {
    return this.role() === 'HotelManager' ? this.myHotels() : this.allHotels();
  });

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      const userRole = user?.roles?.[0] ?? null;
      this.role.set(userRole);
      
      if (user) {
        this.loadDashboardData();
      }
    });
  }

  private loadDashboardData() {
    const userRole = this.role();
    
    if (userRole === 'User') {
      this.loadMyBookings();
    } else if (userRole === 'Admin') {
      this.loadAllBookings();
      this.loadAllUsers();
      this.loadHotels();
      this.loadInternationalTransports();
      this.loadGroundTransports();
    } else if (userRole === 'HotelManager') {
      this.loadMyBookings();
      this.loadHotels();
    }
  }

  loadMyBookings() {
    this.bookingsLoading.set(true);
    this.bookings.getMyBookingsWithCache().subscribe({
      next: (bookings) => {
        this.myBookings.set(bookings);
        this.bookingsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bookings', err);
        this.toastr.error('Failed to load bookings');
        this.bookingsLoading.set(false);
      }
    });
  }

  loadAllBookings() {
    this.bookingsLoading.set(true);
    this.bookings.getAllBookings().subscribe({
      next: (bookings) => {
        this.allBookings.set(bookings);
        this.bookingsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load all bookings', err);
        this.toastr.error('Failed to load all bookings');
        this.bookingsLoading.set(false);
      }
    });
  }

  loadAllUsers() {
    this.usersLoading.set(true);
    this.http.get<{ data: UserDto[] }>(`${environment.apiUrl}/Auth/Users`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allUsers.set(response.data);
        this.usersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.toastr.error('Failed to load users');
        this.usersLoading.set(false);
      }
    });
  }

  loadUsersByRole(role: string) {
    this.usersLoading.set(true);
    this.http.get<{ data: UserDto[] }>(`${environment.apiUrl}/Auth/UsersByRole/${role}`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.usersByRole.set(response.data);
        this.usersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users by role', err);
        this.toastr.error('Failed to load users by role');
        this.usersLoading.set(false);
      }
    });
  }

  updateBookingStatus(bookingId: number | string | null | undefined, status: string) {
    if (!bookingId) {
      this.toastr.error('Invalid booking ID');
      return;
    }

    this.bookings.updateStatus(String(bookingId), status).subscribe({
      next: () => {
        this.toastr.success('Booking status updated');
        this.loadAllBookings();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.toastr.error('Failed to update status');
      }
    });
  }

  cancelBooking(booking: BookingDto) {
    const createdDate = new Date(booking.createdAt || '');
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreation > 7) {
      this.toastr.error('Cannot cancel booking after 7 days');
      return;
    }

    if (confirm(this.i18n.t('dashboard.confirmCancel'))) {
      this.bookings.cancelBooking(String(booking.id)).subscribe({
        next: () => {
          this.toastr.success('Booking cancelled successfully');
          this.loadMyBookings();
        },
        error: (err) => {
          console.error('Failed to cancel booking', err);
          this.toastr.error('Failed to cancel booking');
        }
      });
    }
  }

  openRoleModal(user: UserDto) {
    this.selectedUser.set(user);
    this.roleToAssign.set('User');
    this.showRoleModal.set(true);
  }

  assignRole() {
    const user = this.selectedUser();
    if (!user) return;

    const payload: AssignRoleDto = {
      userId: user.id,
      roleName: this.roleToAssign()
    };

    this.http.post(`${environment.apiUrl}/Auth/AssignRole`, payload, { withCredentials: true }).subscribe({
      next: () => {
        this.toastr.success('Role assigned successfully');
        this.showRoleModal.set(false);
        this.loadAllUsers();
      },
      error: (err: any) => {
        console.error('Failed to assign role', err);
        this.toastr.error('Failed to assign role');
      }
    });
  }

  removeRole(user: UserDto, role: string) {
    if (confirm(`Remove ${role} role from ${user.fullName}?`)) {
      const payload: AssignRoleDto = {
        userId: user.id,
        roleName: role
      };

      this.http.post(`${environment.apiUrl}/Auth/RemoveRole`, payload, { withCredentials: true }).subscribe({
        next: () => {
          this.toastr.success('Role removed successfully');
          this.loadAllUsers();
        },
        error: (err: any) => {
          console.error('Failed to remove role', err);
          this.toastr.error('Failed to remove role');
        }
      });
    }
  }

  setActiveView(view: 'overview' | 'bookings' | 'users' | 'hotels' | 'international-transport' | 'ground-transport') {
    this.activeView.set(view);
    this.searchQuery.set('');
    
    if (view === 'bookings' && this.role() === 'Admin' && this.allBookings().length === 0) {
      this.loadAllBookings();
    }
    if (view === 'users' && this.allUsers().length === 0) {
      this.loadAllUsers();
    }
    if (view === 'hotels') {
      if (this.role() === 'Admin' && this.allHotels().length === 0) {
        this.loadHotels();
      } else if (this.role() === 'HotelManager' && this.myHotels().length === 0) {
        this.loadHotels();
      }
    }
    if (view === 'international-transport' && this.role() === 'Admin' && this.allInternationalTransports().length === 0) {
      this.loadInternationalTransports();
    }
    if (view === 'ground-transport' && this.role() === 'Admin' && this.allGroundTransports().length === 0) {
      this.loadGroundTransports();
    }
  }

  updateSearchQuery(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  updateUserRoleFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.userRoleFilter.set(value);
  }

  updateBookingStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.bookingStatusFilter.set(value);
  }

  updateRoleToAssign(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.roleToAssign.set(value);
  }

  canCancelBooking(booking: BookingDto): boolean {
    if (this.role() !== 'User') return false;
    const createdDate = new Date(booking.createdAt || '');
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 7 && booking.status !== 'Cancelled';
  }

  getDaysSinceCreation(booking: BookingDto): number {
    const createdDate = new Date(booking.createdAt || '');
    return Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(dateStr?: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  }

  getBookingType(booking: BookingDto): string {
    return booking.type || 'Package';
  }

  calculateDaysLeft(createdAt?: string | null): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const tripDate = new Date(created);
    tripDate.setDate(tripDate.getDate() + 30); // Assume trip is 30 days after booking
    const today = new Date();
    const diff = tripDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getTimeAgo(dateStr?: string | null): string {
    if (!dateStr) return 'recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  logout() {
    // close menu if open
    this.showUserMenu.set(false);
    this.auth.logout().subscribe({
      next: () => {
        this.toastr.success('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.toastr.error('Logout failed');
      }
    });
  }

  // NEW: header helper utilities
  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const a = first ? first.charAt(0) : (user.fullName ? user.fullName.charAt(0) : 'U');
    const b = last ? last.charAt(0) : '';
    return (a + b).toUpperCase();
  }

  currentUserName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  currentUserPhone(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.phoneNumber || user.phone || '—';
  }

  goToProfile() {
    this.closeUserMenu();
    // Navigate to profile page if available
    try {
      this.router.navigate(['/profile']);
    } catch (e) {
      // ignore if route not configured
      console.warn('Profile route not available');
    }
  }

  // Hotel Management Methods
  loadHotels() {
    this.hotelsLoading.set(true);
    const url = this.role() === 'HotelManager' 
      ? `${environment.apiUrl}/Hotel/GetMyHotels`
      : `${environment.apiUrl}/Hotel/GetAllFiltered`;

    this.http.get<{ data: HotelDto[] }>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        if (this.role() === 'HotelManager') {
          this.myHotels.set(response.data);
        } else {
          this.allHotels.set(response.data);
        }
        this.hotelsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load hotels', err);
        this.toastr.error('Failed to load hotels');
        this.hotelsLoading.set(false);
      }
    });
  }

  openHotelModal(hotel?: HotelDto) {
    this.selectedFile = null;
    if (hotel) {
      this.hotelFormData = { ...hotel };
      this.selectedHotel.set(hotel);
    } else {
      this.hotelFormData = {
        name: '',
        address: '',
        city: 'Makkah',
        pricePerNight: 0,
        availableRooms: 0,
        starRating: 3,
        distanceToHaram: 0,
        description: '',
        descriptionAr: '',
        amenities: ''
      };
      this.selectedHotel.set(null);
    }
    this.showHotelModal.set(true);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  saveHotel() {
    const hotelData = this.hotelFormData;
    const isEdit = !!this.selectedHotel();
    const url = isEdit 
      ? `${environment.apiUrl}/Hotel/UpdateHotel/${hotelData.id}`
      : `${environment.apiUrl}/Hotel/CreateHotel`;

    const formData = new FormData();
    Object.entries(hotelData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'id' && key !== 'imageUrl') {
        formData.append(key, String(value));
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (isEdit && hotelData.imageUrl) {
      formData.append('imageUrl', hotelData.imageUrl);
    }

    const request = isEdit 
      ? this.http.put(url, formData, { withCredentials: true })
      : this.http.post(url, formData, { withCredentials: true });

    request.subscribe({
      next: (resp: any) => {
        console.log('Save hotel response', resp);
        this.toastr.success(isEdit ? 'Hotel updated successfully' : 'Hotel created successfully');
        this.showHotelModal.set(false);
        this.loadHotels();
      },
      error: (err: any) => {
        console.error('Failed to save hotel', err);
        const serverMessage = err?.error?.message || err?.message || 'Failed to save hotel';
        this.toastr.error(serverMessage);
      }
    });
  }

  deleteHotel(id: number) {
    if (confirm(this.i18n.t('dashboard.confirmDelete'))) {
      this.http.delete(`${environment.apiUrl}/Hotel/DeleteHotel/${id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.toastr.success('Hotel deleted successfully');
          this.loadHotels();
        },
        error: (err) => {
          console.error('Failed to delete hotel', err);
          this.toastr.error('Failed to delete hotel');
        }
      });
    }
  }

  // International Transport Methods
  loadInternationalTransports() {
    this.internationalTransportsLoading.set(true);
    this.http.get<{ data: InternationalTransportDto[] }>(`${environment.apiUrl}/InternationalTransport/GetAllTransports`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allInternationalTransports.set(response.data);
        this.internationalTransportsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load international transports', err);
        this.toastr.error('Failed to load international transports');
        this.internationalTransportsLoading.set(false);
      }
    });
  }

  openInternationalTransportModal(transport?: InternationalTransportDto) {
    if (transport) {
      this.internationalTransportFormData = { ...transport };
      this.selectedInternationalTransport.set(transport);
    } else {
      this.internationalTransportFormData = {
        carrierName: '',
        internationalTransportType: 'Flight',
        departureAirport: '',
        departureAirportCode: '',
        arrivalAirport: '',
        arrivalAirportCode: '',
        departureDate: '',
        arrivalDate: '',
        price: 0,
        totalSeats: 0,
        availableSeats: 0,
        flightNumber: '',
        isActive: true
      };
      this.selectedInternationalTransport.set(null);
    }
    this.showInternationalTransportModal.set(true);
  }

  saveInternationalTransport() {
    const transportData = this.internationalTransportFormData;
    const isEdit = !!this.selectedInternationalTransport();
    const url = isEdit 
      ? `${environment.apiUrl}/InternationalTransport/UpdateTransport/${transportData.id}`
      : `${environment.apiUrl}/InternationalTransport/CreateTransport`;

    const request = isEdit 
      ? this.http.put(url, transportData, { withCredentials: true })
      : this.http.post(url, transportData, { withCredentials: true });

    request.subscribe({
      next: () => {
        this.toastr.success(isEdit ? 'Transport updated successfully' : 'Transport created successfully');
        this.showInternationalTransportModal.set(false);
        this.loadInternationalTransports();
      },
      error: (err: any) => {
        console.error('Failed to save transport', err);
        this.toastr.error('Failed to save transport');
      }
    });
  }

  deleteInternationalTransport(id: number) {
    if (confirm(this.i18n.t('dashboard.confirmDelete'))) {
      this.http.delete(`${environment.apiUrl}/InternationalTransport/DeleteTransport/${id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.toastr.success('Transport deleted successfully');
          this.loadInternationalTransports();
        },
        error: (err) => {
          console.error('Failed to delete transport', err);
          this.toastr.error('Failed to delete transport');
        }
      });
    }
  }

  // Ground Transport Methods
  loadGroundTransports() {
    this.groundTransportsLoading.set(true);
    this.http.get<{ data: GroundTransportDto[] }>(`${environment.apiUrl}/GroundTransport/GetAllGroundTransports`, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allGroundTransports.set(response.data);
        this.groundTransportsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load ground transports', err);
        this.toastr.error('Failed to load ground transports');
        this.groundTransportsLoading.set(false);
      }
    });
  }

  openGroundTransportModal(transport?: GroundTransportDto) {
    if (transport) {
      this.groundTransportFormData = { ...transport };
      this.selectedGroundTransport.set(transport);
    } else {
      this.groundTransportFormData = {
        serviceName: '',
        serviceNameAr: '',
        type: 0,
        pricePerPerson: 0,
        description: '',
        descriptionAr: '',
        capacity: 0,
        isActive: true
      };
      this.selectedGroundTransport.set(null);
    }
    this.showGroundTransportModal.set(true);
  }

  saveGroundTransport() {
    const transportData = this.groundTransportFormData;
    const isEdit = !!this.selectedGroundTransport();
    const url = isEdit 
      ? `${environment.apiUrl}/GroundTransport/UpdateGroundTransport/${transportData.id}`
      : `${environment.apiUrl}/GroundTransport/CreateGroundTransport`;

    const request = isEdit 
      ? this.http.put(url, transportData, { withCredentials: true })
      : this.http.post(url, transportData, { withCredentials: true });

    request.subscribe({
      next: () => {
        this.toastr.success(isEdit ? 'Transport updated successfully' : 'Transport created successfully');
        this.showGroundTransportModal.set(false);
        this.loadGroundTransports();
      },
      error: (err: any) => {
        console.error('Failed to save transport', err);
        this.toastr.error('Failed to save transport');
      }
    });
  }

  deleteGroundTransport(id: number) {
    if (confirm(this.i18n.t('dashboard.confirmDelete'))) {
      this.http.delete(`${environment.apiUrl}/GroundTransport/DeleteGroundTransport/${id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.toastr.success('Transport deleted successfully');
          this.loadGroundTransports();
        },
        error: (err) => {
          console.error('Failed to delete transport', err);
          this.toastr.error('Failed to delete transport');
        }
      });
    }
  }


  getTransportTypeName(type: string | number, isInternational: boolean): string {
    if (isInternational) {
      return String(type);
    } else {
      return type === 0 ? 'Private Car' : type === 1 ? 'Shared Bus' : 'Taxi';
    }
  }

  getHotelImage(hotel: HotelDto): string {
    if (!hotel.imageUrl) return 'assets/images/hotel-placeholder.jpg';
    if (hotel.imageUrl.startsWith('http')) return hotel.imageUrl;
    // Use configured image base URL
    return `${environment.apiUrlForImages}${hotel.imageUrl}`;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/hotel-placeholder.jpg';
  }

  viewHotelDetails(hotel: HotelDto) {
    if (!hotel || !hotel.id) return;
    this.router.navigate(['/hotels', hotel.id]);
  }

  // Helper methods for UI
  getBookingViewTitle(): string {
    return this.role() === 'Admin' ? this.i18n.t('dashboard.menu.dashboard') : this.i18n.t('dashboard.menu.myBookings');
  }

  getWelcomeMessage(): string {
    const role = this.role();
    if (role === 'Admin') return this.i18n.t('dashboard.welcome.admin');
    if (role === 'HotelManager') return this.i18n.t('dashboard.welcome.hotelManager');
    return this.i18n.t('dashboard.welcome.user');
  }

  getBookingsMenuLabel(): string {
    return this.role() === 'Admin' ? this.i18n.t('dashboard.menu.dashboard') : this.i18n.t('dashboard.menu.myBookings');
  }
}


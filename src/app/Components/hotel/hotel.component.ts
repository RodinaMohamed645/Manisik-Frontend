import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HotelsService } from 'src/app/core/services/hotels.service';
import { Hotel, HotelSearchParams } from 'src/app/interfaces/hotel.interface';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-hotel',
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './hotel.component.html',
  styleUrl: './hotel.component.css',
})
export class HotelComponent implements OnInit {
  viewMode: 'grid' | 'list' = 'grid';
  searchText: string = '';
  city: string = 'Makkah';
  sortBy: string = 'recommended'; // default option
  loading = false;

  hotels: Hotel[] = [];
  constructor(private hotelService: HotelsService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels() {
    this.loading = true;

    const params: HotelSearchParams = {
      city: this.city,
      sortBy: '', // default empty
    };

    switch (this.sortBy) {
      case 'pricelowtohigh':
        params.sortBy = 'pricelowtohigh';
        break;
      case 'pricehightolow':
        params.sortBy = 'pricehightolow';
        break;
      case 'distance':
        params.sortBy = 'distance';
        break;
      case 'rating':
        params.sortBy = 'rating';
        break;
      default:
        params.sortBy = '';
        break;
    }

    // Call the service with combined city and sort filter
    this.hotelService.getHotels(params).subscribe({
      next: (data) => {
        this.hotels = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load hotels', err);
        this.hotels = [];
        this.loading = false;
      },
    });
  }

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
  getImageUrl(hotel: Hotel): string {
    return this.hotelService.getImageUrl(hotel);
  }
  filteredHotels() {
    let filtered = this.hotels;
    // Filter by search text
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter((hotel) =>
        hotel.name.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }
  onFilterChange() {
    this.loadHotels();
  }
}

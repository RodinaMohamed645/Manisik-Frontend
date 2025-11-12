import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

// Interfaces
export interface QuickAction {
  icon: string;
  title: string;
  description: string;
  color: string;
  route?: string;
}

export interface Package {
  id: number;
  title: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  category: string;
  included: string[];
}

export interface Step {
  icon: string;
  step: string;
  title: string;
  description: string;
}

export interface Statistic {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  verified: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);

  // State management
  readonly animateIn = signal<boolean>(false);
  readonly openFAQ = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly newsletterEmail = signal<string>('');
  readonly isSubmittingNewsletter = signal<boolean>(false);

  // Quick Actions Data
  readonly actions: QuickAction[] = [
    {
      icon: 'package',
      title: 'Book Complete Package',
      description: 'All-inclusive Umrah planning',
      color: 'rgba(var(--primary-rgb), 0.1)',
      route: '/packages',
    },
    {
      icon: 'building-2',
      title: 'Find Hotels',
      description: 'Near Haram with best prices',
      color: 'rgba(16, 185, 129, 0.1)',
      route: '/hotels',
    },
    {
      icon: 'bus',
      title: 'Transport Options',
      description: 'Comfortable & reliable',
      color: 'rgba(245, 158, 11, 0.1)',
      route: '/transport',
    },
  ];

  // Featured Packages Data
  readonly packages: Package[] = [
    {
      id: 1,
      title: 'Premium Umrah Package',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzYxOTExMzQwfDA&ixlib=rb-4.1.0&q=80&w=1080 ',
      price: 2499,
      duration: '14 Days',
      rating: 4.8,
      reviews: 234,
      category: 'Premium',
      included: ['5-Star Hotel', 'Flight Included', 'Visa Assistance', 'Transport']
    },
    {
      id: 2,
      title: 'Standard Umrah Package',
      image: 'https://images.unsplash.com/photo-1662104128135-7bd873b2befd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwcGF0dGVybnxlbnwxfHx8fDE3NjE5Nzk0NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080 ',
      price: 1799,
      duration: '10 Days',
      rating: 4.6,
      reviews: 189,
      category: 'Standard',
      included: ['4-Star Hotel', 'Visa Assistance', 'Transport', 'Breakfast']
    },
    {
      id: 3,
      title: 'Economy Umrah Package',
      image: 'https://images.unsplash.com/photo-1571909552531-1601eaec8f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYWFiYSUyMG1lY2NhJTIwaG9seXxlbnwxfHx8fDE3NjIwMDAzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080 ',
      price: 1299,
      duration: '7 Days',
      rating: 4.5,
      reviews: 156,
      category: 'Economy',
      included: ['3-Star Hotel', 'Visa Assistance', 'Shared Transport']
    },
    {
      id: 4,
      title: 'VIP Umrah Experience',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzYxOTExMzQwfDA&ixlib=rb-4.1.0&q=80&w=1080 ',
      price: 4999,
      duration: '21 Days',
      rating: 5.0,
      reviews: 98,
      category: 'VIP',
      included: ['Luxury Hotel', 'Business Class', 'Private Guide', '24/7 Concierge']
    }
  ];

  // Filtered packages based on selected category
  filteredPackages = computed(() => {
    const category = this.selectedCategory();
    if (category === 'All') return this.packages;
    return this.packages.filter(p => p.category === category);
  });

  // Categories for filter
  readonly categories = ['All', 'Economy', 'Standard', 'Premium', 'VIP'];
  selectedCategory = signal('All');

  // How It Works Data
  readonly steps: Step[] = [
    {
      icon: 'search',
      step: '01',
      title: 'Choose Package/Services',
      description: 'Browse our curated packages or build your own custom journey'
    },
    {
      icon: 'settings',
      step: '02',
      title: 'Customize Your Trip',
      description: 'Select hotels, transport, and dates that work best for you'
    },
    {
      icon: 'credit-card',
      step: '03',
      title: 'Secure Payment',
      description: 'Pay securely with multiple payment options and flexible plans'
    },
    {
      icon: 'check-circle',
      step: '04',
      title: 'Receive Confirmation',
      description: 'Get instant confirmation and all travel documents via email'
    }
  ];

  // Statistics Data
  readonly stats: Statistic[] = [
    { icon: 'users', value: 50000, suffix: '+', label: 'Total Bookings' },
    { icon: 'trending-up', value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { icon: 'headphones', value: 24, suffix: '/7', label: 'Support Available' },
    { icon: 'map-pin', value: 200, suffix: '+', label: 'Destinations' }
  ];

  // Testimonials Data
  readonly testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed ',
      rating: 5,
      text: 'Manisik made my Umrah journey incredibly smooth. From booking to arrival, everything was perfectly organized. The hotel was close to Haram and the support team was always available. Highly recommended!',
      verified: true
    },
    {
      id: 2,
      name: 'Fatima Zahra',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima ',
      rating: 5,
      text: 'As a first-time pilgrim, I was nervous about planning everything. Manisik\'s team guided me through every step. The package was affordable and the experience was life-changing. JazakAllah Khair!',
      verified: true
    },
    {
      id: 3,
      name: 'Mohammad Ali',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad ',
      rating: 5,
      text: 'Best Umrah booking platform! The website is easy to use, prices are transparent, and customer service is exceptional. I\'ve booked my third trip with them and will continue to do so.',
      verified: true
    }
  ];

  // FAQ Data
  readonly faqs: FAQ[] = [
    {
      question: 'How do I book an Umrah package?',
      answer: 'Booking is simple! Browse our packages, select your preferred dates and accommodations, fill in your details, and complete the secure payment. You\'ll receive instant confirmation via email.'
    },
    {
      question: 'What is included in the Umrah packages?',
      answer: 'Our packages typically include accommodation, visa processing assistance, transport between cities, and 24/7 customer support. Specific inclusions vary by package tier (Economy, Standard, Premium, VIP).'
    },
    {
      question: 'Can I customize my package?',
      answer: 'Yes! You can build a custom package by selecting individual services like hotels, flights, and transport. Our team can also help you create a personalized itinerary.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellation policies vary by package and service provider. Generally, we offer free cancellation up to 30 days before departure. Please check specific terms during booking.'
    },
    {
      question: 'Do you assist with visa applications?',
      answer: 'Yes, we provide comprehensive visa assistance including document verification, application submission, and follow-up. Visa fees are typically included in our packages.'
    },
    {
      question: 'Is travel insurance included?',
      answer: 'Travel insurance is optional and can be added during booking. We highly recommend it for your peace of mind and protection during your journey.'
    },
    {
      question: 'How close are the hotels to Masjid al-Haram?',
      answer: 'We partner with hotels at various distances from the Haram. You can filter by distance during booking. Most of our hotels are within walking distance (100m-2km).'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, bank transfers, and offer flexible installment plans for qualifying bookings.'
    }
  ];

  ngOnInit(): void {
    // Trigger hero animation on load
    setTimeout(() => this.animateIn.set(true), 100);
  }

  /**
   * Set selected category filter
   */
  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  /**
   * Toggle FAQ item open/close state
   */
  toggleFAQ(question: string): void {
    this.openFAQ.update((current) => (current === question ? null : question));
  }

  /**
   * Check if FAQ is open
   */
  isFAQOpen(question: string): boolean {
    return this.openFAQ() === question;
  }

  /**
   * Handle search form submission
   */
  onSearchSubmit(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router
        .navigate(['/search'], { queryParams: { q: query } })
        .catch((err) => console.error('Navigation error:', err));
    }
  }

  /**
   * Handle quick action click
   */
  onActionClick(action: QuickAction): void {
    if (action.route) {
      this.router
        .navigate([action.route])
        .catch((err) => console.error('Navigation error:', err));
    }
  }

  /**
   * Handle package view details
   */
  onViewPackageDetails(packageId: number): void {
    this.router
      .navigate(['/packages', packageId])
      .catch((err) => console.error('Navigation error:', err));
  }

  /**
   * Handle view all packages
   */
  onViewAllPackages(): void {
    this.router
      .navigate(['/packages'])
      .catch((err) => console.error('Navigation error:', err));
  }

  /**
   * Handle newsletter subscription
   */
  onNewsletterSubmit(): void {
    const email = this.newsletterEmail().trim();
    if (!email || !this.isValidEmail(email)) {
      // TODO: Show error message
      return;
    }

    this.isSubmittingNewsletter.set(true);
    // TODO: Implement newsletter subscription API call
    setTimeout(() => {
      this.isSubmittingNewsletter.set(false);
      this.newsletterEmail.set('');
      // TODO: Show success message
    }, 1000);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate array of numbers for star rating display
   */
  getStarArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
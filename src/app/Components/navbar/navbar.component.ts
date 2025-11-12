import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

export interface NavLink {
  label: string;
  path: string;
  icon?: string;
}

export interface NavIcon {
  name: string;
  ariaLabel: string;
  action?: () => void;
  showBadge?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private readonly router = inject(Router);

  // State management
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly cartCount = signal<number>(0);

  // Computed properties
  readonly hasCartItems = computed(() => this.cartCount() > 0);

  // Desktop navigation links
  readonly navLinks: NavLink[] = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Packages', path: '/packages' },
    { label: 'Hotels', path: '/hotels' },
    { label: 'Transport', path: '/transport' },
    { label: 'About', path: '/about' },
  ];

  // Action icons with handlers
  readonly navIcons: NavIcon[] = [
    {
      name: 'search',
      ariaLabel: 'Search',
      action: () => this.handleSearch(),
    },
    {
      name: 'globe',
      ariaLabel: 'Change Language',
      action: () => this.handleLanguageChange(),
    },
    {
      name: 'moon',
      ariaLabel: 'Toggle Dark Mode',
      action: () => this.handleThemeToggle(),
    },
    {
      name: 'shopping-cart',
      ariaLabel: 'View Shopping Cart',
      action: () => this.handleCartClick(),
      showBadge: true,
    },
    {
      name: 'user',
      ariaLabel: 'User Account',
      action: () => this.handleUserClick(),
    },
    {
      name: 'menu',
      ariaLabel: 'Toggle Mobile Menu',
      action: () => this.toggleMobileMenu(),
    },
  ];

  /**
   * Toggle mobile menu visibility
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Handle navigation link click (close mobile menu)
   */
  onNavLinkClick(): void {
    this.closeMobileMenu();
  }

  /**
   * Handle icon click actions
   */
  onIconClick(icon: NavIcon): void {
    if (icon.action) {
      icon.action();
    }
  }

  /**
   * Handle search icon click
   */
  private handleSearch(): void {
    // TODO: Implement search functionality
    console.log('Search clicked');
  }

  /**
   * Handle language change
   */
  private handleLanguageChange(): void {
    // TODO: Implement language switching
    console.log('Language change clicked');
  }

  /**
   * Handle theme toggle
   */
  private handleThemeToggle(): void {
    // TODO: Implement dark mode toggle
    console.log('Theme toggle clicked');
  }

  /**
   * Handle cart icon click
   */
  private handleCartClick(): void {
    this.router.navigate(['/cart']).catch((err) => console.error('Navigation error:', err));
  }

  /**
   * Handle user icon click
   */
  private handleUserClick(): void {
    this.router.navigate(['/profile']).catch((err) => console.error('Navigation error:', err));
  }

  /**
   * Update cart count (can be called from a service)
   */
  updateCartCount(count: number): void {
    this.cartCount.set(count);
  }
}

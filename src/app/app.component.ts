import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatListModule} from '@angular/material/list';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { FooterComponent } from './Components/footer/footer.component'; 
import { LoadingService } from './core/services/loading.service';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [MatListModule, RouterOutlet, FormsModule, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Manasik-Client';
  private authService = inject(AuthService);
  
  constructor(public LoadingService : LoadingService) {}

  ngOnInit() {
    // Check authentication status on app initialization
    // This handles page refresh and maintains login state via httpOnly cookies
    this.authService.checkAuth().subscribe();
  }
}

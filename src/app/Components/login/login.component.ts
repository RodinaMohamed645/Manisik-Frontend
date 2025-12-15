import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule ,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone : true
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        if (response?.data?.token) {
          const name = response.data.user?.firstName ?? '';
          this.toastr.success(`Login successful! Welcome ${name}`, 'Success');
          const navigateTo = this.returnUrl || '/';
          this.router.navigateByUrl(navigateTo).catch(() => {});
        } else {
          this.errorMessage = 'Login failed. Please try again.';

        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';

      }
    });
  }
}

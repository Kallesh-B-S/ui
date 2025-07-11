import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/services/common/auth.service';
import { NotificationService } from '../core/services/common/notification.service';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { ApiErrorHandlerService } from '../core/services/common/api-error-handler.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registrationForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  // tokenError: boolean = false;
  //token: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ApiErrorHandlerService);

  constructor() {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // // Get token from URL if present
    // this.token = this.route.snapshot.paramMap.get('token');

    // // Check if token is null or empty
    // if (!this.token || this.token.trim() === '') {
    //   this.tokenError = true;
    // }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.registrationForm.value;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        let errorMessage = `Registration failed.  Please request a new registration link from your administrator.`;
        this.notificationService.showError(errorMessage);
        console.error('Registration failed:', error);
      }
    });
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }
}

import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiErrorHandlerService } from '../core/services/common/api-error-handler.service';
import { AuthService } from '../core/services/common/auth.service';
import { NotificationService } from '../core/services/common/notification.service';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordRequestCompleted: boolean = false;
  forgotPasswordRequestForm: FormGroup;
  forgotPasswordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  token: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ApiErrorHandlerService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.forgotPasswordRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // // Get token from URL if present
    this.token = this.route.snapshot.paramMap.get('token');

    // Check if token is null or empty
    if (this.token && this.token.trim() !== '') {
      this.forgotPasswordRequestCompleted = true;
    }
  }

  onRequest(): void {
    if (this.forgotPasswordRequestForm.invalid) {
      this.forgotPasswordRequestForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotPasswordRequestForm.value;

    this.authService.sendEmail(email, 'FORGOT_PASSWORD').subscribe({
      next: () => {
        this.notificationService.showSuccess('A mail has been sent successfully to your email to setup a new password.');
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        let errorMessage = this.errorHandler.handleApiError(error, `Request failed. Please try again.`);
        this.notificationService.showError(errorMessage);
        console.error('Forgot password request failed:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email, password, this.token!).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password reset successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        let errorMessage = this.errorHandler.handleApiError(error, `Password request failed. Please try again.`);
        this.notificationService.showError(errorMessage);
        console.error('Forgot password request failed:', error);
      }
    });
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get emailRequest() {
    return this.forgotPasswordRequestForm.get('email');
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  get password() {
    return this.forgotPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.forgotPasswordForm.get('confirmPassword');
  }
}

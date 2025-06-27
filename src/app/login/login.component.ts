import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/common/auth.service';
import { NavigationService } from '../core/services/common/navigation.service';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { User } from '../core/models/user';
import { UserService } from '../core/services/common/user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, AngularMaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private navigationService = inject(NavigationService);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.navigationService.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response?.message) {
            this.userService.setUser(response?.email);
            this.setUserData();
          } else {
            this.errorMessage = response?.error ?? response?.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid username or password';
          console.error('Login error:', error);
        }
      });
    }
  }


  setUserData() {

    this.userService.setUserDetails().subscribe({
      next: (data: User) => {
        if (data?.userDetails) {
          this.navigationService.navigate(['home']);
        } else {
          this.errorMessage = "User doesn't have permissions.";
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = "User doesn't have permissions.";
        console.error('Error retrieving app data:', error);
      }
    });
  }
}
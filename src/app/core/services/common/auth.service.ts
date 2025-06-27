import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserService } from './user.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { ApiErrorHandlerService } from './api-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private userService = inject(UserService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ApiErrorHandlerService);

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { p_emailaddr: username, p_password: password });
  }

  refreshToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/refresh-tokens`, {});
  }

  logout(): void {
    if (this.userService.isLoggedIn()) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: (response) => {
          this.userService.clearUser();
          this.storageService.clear();
          this.router.navigate(['/login']);
        }
        , error: (error) => {
          let errorMessage = this.errorHandler.handleApiError(error, `Logout failed`);
          this.notificationService.showError(errorMessage);
          console.error('Logout failed:', error);
        }
      });
    }
  }
}

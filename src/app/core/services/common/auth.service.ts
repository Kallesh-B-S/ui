import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

  constructor(private http: HttpClient,
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    private notificationService: NotificationService,
    private errorHandler: ApiErrorHandlerService
  ) { }

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

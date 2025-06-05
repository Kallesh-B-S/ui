import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly USER_EMAIL_KEY = 'CurrentUserEmail';
  private userLoggedInSubject = new BehaviorSubject<boolean>(true);

  constructor(private storageService: StorageService) { }

  watchUser(): Observable<boolean> {
    return this.userLoggedInSubject.asObservable();
  }

  setUser(email: string): void {
    if (!email) {
      console.error('Cannot set empty user email');
      return;
    }

    this.storageService.setItem(this.USER_EMAIL_KEY, email);
    this.userLoggedInSubject.next(true);
  }

  getUser(): string | null {
    const user = this.storageService.getItem(this.USER_EMAIL_KEY);
    if (!user) {
      this.userLoggedInSubject.next(false);
    }
    return user;
  }

  clearUser(): void {
    this.storageService.removeItem(this.USER_EMAIL_KEY);
    this.userLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getSafeUser(): string {
    return this.getUser() || '';
  }
}

import { afterNextRender, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, map, Observable, of, Subject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Menu, User, UserDetail } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  userDetailsSignal = signal<User>({});

  private readonly USER_EMAIL_KEY = 'CurrentUserEmail';
  private readonly USER_DETAILS_KEY = 'CurrentUserData';

  private userLoggedInSubject = new BehaviorSubject<boolean>(false);

  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  constructor() {
    afterNextRender(() => {
      // Initialize user details from storage if available
      const userDetails = this.getUserDetails();
      if (userDetails) {
        this.userDetailsSignal.set(userDetails);
      }

      // Check if user is logged in
      const userEmail = this.getUser();
      this.userLoggedInSubject.next(!!userEmail);
    });
  }

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

  setUserDetails(): Observable<User> {
    const userDetails = this.getUserDetails();

    if (userDetails) {
      return of(userDetails);
    }

    const email = this.getUser();

    if (!email) {
      console.error('invalid user');
    }

    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetUserDetails/${email}`).pipe(
      map(response => this.mapToUser(response)),
      tap(user => this.saveUserToStorage(user)));
  }

  getUserDetails(): User | null {
    return this.storageService.get<User>(this.USER_DETAILS_KEY);
  }

  clearUser(): void {
    this.storageService.removeItem(this.USER_EMAIL_KEY);
    this.storageService.removeItem(this.USER_DETAILS_KEY);
    this.userLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getSafeUser(): string {
    return this.getUser() || '';
  }

  getUserSpid(): number {
    const userDetails = this.getUserDetails();
    return userDetails?.userDetails?.spid ?? 0;
  }

  getUserClientid(): number {
    const userDetails = this.getUserDetails();
    return userDetails?.userDetails?.clientid ?? 0;
  }

  getUserLocationid(): number {
    const userDetails = this.getUserDetails();
    return userDetails?.userDetails?.locationid ?? 0;
  }

  private mapToUser(data: any): User {
    return {
      roles: data.roleDetails || null,
      menus: data.menuDetails || null,
      menuDetails: this.mapMenuDetails(data.menuPageDetails),
      userDetails: this.mapUserDetails(data.userDetails)
    };
  }

  private mapMenuDetails(menuPageDetails: any[]): Menu[] | null {
    if (!menuPageDetails) return null;

    return menuPageDetails.map(item => ({
      name: item.MENUNAME,
      pageName: item.PAGENAME
    }));
  }

  private mapUserDetails(userDetails: any): UserDetail | null {
    if (!userDetails) return null;

    return {
      spid: userDetails.SPID,
      clientid: userDetails.CLIENTID,
      locationid: userDetails.LOCATIONID,
      urlKey: userDetails.ENCURLKEY,
      logoName: userDetails.LOGONAME,
      themeName: userDetails.THEMENAME
    };
  }

  private saveUserToStorage(user: User): void {
    try {
      this.storageService.set(this.USER_DETAILS_KEY, user);
      this.userDetailsSignal.set(user);
    } catch (e) {
      console.error('Error saving user details to session storage', e);
    }
  }
}

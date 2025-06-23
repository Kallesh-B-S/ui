import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  constructor() { }
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  getItem(key: string): string | null {

    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem(key);
    }

    return null;
  }

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (e) {
      console.error(`Error getting ${key} from session storage`, e);
      return null;
    }
  }

  set(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting ${key} in session storage`, e);
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

}

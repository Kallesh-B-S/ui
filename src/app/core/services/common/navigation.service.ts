import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  //private readonly USER_APPID_KEY = 'CurrentAppId';

  private router = inject(Router);
  private location = inject(Location);

  /* Not applicable for this app   
  setCurrentAppId(appId: string): void {
    this.storageService.setItem(this.USER_APPID_KEY, appId);
  }

  getCurrentAppId(): string {
    return this.storageService.getItem(this.USER_APPID_KEY) ?? '';
  }

  */

  navigate(commands: any[], extras?: any): void {
    //const currentAppId = this.getCurrentAppId();

    // Prepend appId to all navigations
    this.router.navigate(commands, extras);
  }

  navigateByUrl(url: string, extras?: any): void {
    //const currentAppId = this.getCurrentAppId();

    // Ensure URL starts with current appId
    const fullUrl = `/${url.startsWith('/') ? url : `/${url}`}`;
    this.router.navigateByUrl(fullUrl, extras);
  }

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }
}

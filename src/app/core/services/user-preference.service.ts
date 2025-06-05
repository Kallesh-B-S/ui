import { Injectable } from '@angular/core';
import { CookieHelperService } from './cookie.service';
import { DEFAULT_USER_PREFERENCES, UserPreferences } from '../models/user-preference';

@Injectable({
    providedIn: 'root'
})
export class UserPreferencesService {
    private readonly COOKIE_KEY = 'user_preferences';

    constructor(private cookieService: CookieHelperService) { }

    getPreferences(): UserPreferences {
        const preferences = this.cookieService.get<UserPreferences>(this.COOKIE_KEY);
        return preferences || { ...DEFAULT_USER_PREFERENCES };
    }

    savePreferences(preferences: UserPreferences): void {
        this.cookieService.set(this.COOKIE_KEY, preferences);
    }

    getUserPrefenceByKey(keyName: string): any {
        const preferences = this.getPreferences();
        return preferences[keyName as keyof typeof preferences];
    }

    resetToDefaults(): void {
        this.cookieService.remove(this.COOKIE_KEY);
    }
}
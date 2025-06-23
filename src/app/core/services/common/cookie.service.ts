import { Injectable } from '@angular/core';
import { CookieService as NgxCookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class CookieHelperService {
    constructor(private ngxCookieService: NgxCookieService) { }

    /**
     * Get a value from cookie
     * @param key Cookie key
     * @returns Parsed JSON value or null if not found
     */
    get<T>(key: string): T | null {
        try {
            const value = this.ngxCookieService.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error parsing cookie value', error);
            return null;
        }
    }

    /**
     * Set a value in cookie
     * @param key Cookie key
     * @param value Value to store (will be stringified)
     * @param expiresDays Number of days until cookie expires (default 365)
     */
    set(key: string, value: any, expiresDays: number = 365): void {
        const expires = new Date();
        expires.setDate(expires.getDate() + expiresDays);
        this.ngxCookieService.set(
            key,
            JSON.stringify(value),
            expires,
            '/',
            undefined,
            false,
            'Lax'
        );
    }

    /**
     * Remove a cookie
     * @param key Cookie key to remove
     */
    remove(key: string): void {
        this.ngxCookieService.delete(key, '/');
    }

    /**
     * Check if a cookie exists
     * @param key Cookie key to check
     */
    has(key: string): boolean {
        return this.ngxCookieService.check(key);
    }
}
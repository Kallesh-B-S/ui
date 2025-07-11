// auth.interceptor.ts
import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/common/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private excludedUrls = ['/register', '/forgot-password'];

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private requestQueue: { request: HttpRequest<any>, next: HttpHandler }[] = [];

  private authService = inject(AuthService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Add withCredentials to all requests except excluded URLs
    if (this.excludedUrls.some(url => request.url.includes(url))) {
      return next.handle(request);
    }

    // Add withCredentials to all requests
    request = request.clone({
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle 401 Unauthorized responses
          if (error.url?.includes('refresh-tokens')) {
            return throwError(() => error);
          }

          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);

          // Retry all queued requests with new token
          this.retryQueuedRequests();

          // Retry the original request
          request = request.clone({
            withCredentials: true
          });

          return next.handle(request);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);

        })
      );
    } else {
      // If token refresh is already in progress, add to queue
      return this.addRequestToQueue(request, next);
    }
  }

  private addRequestToQueue(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return new Observable<HttpEvent<any>>(observer => {
      const subscription = this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      ).subscribe(token => {
        // Remove from queue
        const index = this.requestQueue.findIndex(item => item.request === request);
        if (index > -1) {
          this.requestQueue.splice(index, 1);
        }

        // Retry request with new token
        next.handle(request).subscribe({
          next: event => observer.next(event),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      });

      // Add to queue
      this.requestQueue.push({ request, next });
    });
  }

  private retryQueuedRequests(): void {
    // Process all queued requests
    while (this.requestQueue.length > 0) {
      let { request, next } = this.requestQueue.shift()!;

      request = request.clone({
        withCredentials: true
      });

      next.handle(request).subscribe();
    }
  }
}
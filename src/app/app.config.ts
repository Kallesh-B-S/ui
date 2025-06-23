import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import {
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },]
};

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.trackPageview(e.urlAfterRedirects);
      });
  }

  trackPageview(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    (window as any)['umami']?.track({ url });
  }

  trackEvent(name: string, data?: Record<string, string | number>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    (window as any)['umami']?.track(name, data);
  }
}

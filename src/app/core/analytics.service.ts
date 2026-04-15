import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Analytics service for Google Analytics integration
 * Provides methods to track events and page views
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly GA_MEASUREMENT_ID = 'G-WCX7FPWZXS';

  constructor() {
    this.initializePageTracking();
  }

  /**
   * Track custom events in Google Analytics
   * @param eventName - Name of the event (e.g., 'click_button', 'download_resume')
   * @param eventData - Optional event parameters
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  }

  /**
   * Track page views automatically on route changes
   */
  private initializePageTracking(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: event.urlAfterRedirects,
            page_title: document.title,
          });
        }
      });
  }
}


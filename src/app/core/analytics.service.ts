import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Analytics service for Google Analytics integration
 * Provides methods to track events and page views
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly measurementId = environment.gaMeasurementId;
  private initialized = false;
  private previousPageLocation: string | null = null;

  initialize(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId) || !this.measurementId) {
      return;
    }

    this.initialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, { send_page_view: false });

    this.loadGoogleTagScript();
    this.initializePageTracking();
  }

  /**
   * Track custom events in Google Analytics
   * @param eventName - Name of the event (e.g., 'click_button', 'download_resume')
   * @param eventData - Optional event parameters
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    if (isPlatformBrowser(this.platformId) && window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  }

  /**
   * Track page views automatically on route changes
   */
  private initializePageTracking(): void {
    const router = this.injector.get(Router);

    this.trackPageView(router.url || this.document.location?.pathname || '/');

    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private trackPageView(pagePath: string): void {
    if (!window.gtag) {
      return;
    }

    const origin = this.document.location?.origin ?? '';
    const pageLocation = `${origin}${pagePath}`;
    const pageReferrer = this.previousPageLocation || this.document.referrer || undefined;

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: this.document.title,
      page_location: pageLocation,
      page_referrer: pageReferrer,
    });

    this.previousPageLocation = pageLocation;
  }

  private loadGoogleTagScript(): void {
    const existingScript = this.document.querySelector<HTMLScriptElement>(
      `script[src="https://www.googletagmanager.com/gtag/js?id=${this.measurementId}"]`,
    );

    if (existingScript) {
      return;
    }

    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    this.document.head.appendChild(script);
  }
}


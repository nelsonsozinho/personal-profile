import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly currentTheme = signal<Theme>('light');

  readonly theme = this.currentTheme.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  initTheme(): void {
    const initialTheme = this.resolveInitialTheme();
    this.applyTheme(initialTheme, false);
  }

  toggleTheme(): void {
    this.applyTheme(this.isDark() ? 'light' : 'dark', true);
  }

  private resolveInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    const supportsMatchMedia = typeof window.matchMedia === 'function';
    if (supportsMatchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: Theme, persist: boolean): void {
    this.currentTheme.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);

    if (persist && isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem('theme', theme);
    }
  }
}

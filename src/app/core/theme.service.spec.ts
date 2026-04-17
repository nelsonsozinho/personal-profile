import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    if (window.matchMedia) {
      window.matchMedia = originalMatchMedia;
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
  });

  afterEach(() => {
    localStorage.clear();
    window.matchMedia = originalMatchMedia;

    const document = TestBed.inject(DOCUMENT);
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies dark theme from localStorage on initialization', () => {
    localStorage.setItem('theme', 'dark');
    const service = TestBed.inject(ThemeService);

    service.initTheme();

    const document = TestBed.inject(DOCUMENT);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('uses prefers-color-scheme when no stored theme is present', () => {
    window.matchMedia = () => ({ matches: true } as MediaQueryList);
    const service = TestBed.inject(ThemeService);

    service.initTheme();

    const document = TestBed.inject(DOCUMENT);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles theme and persists user preference', () => {
    const service = TestBed.inject(ThemeService);
    service.initTheme();

    service.toggleTheme();

    const document = TestBed.inject(DOCUMENT);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    service.toggleTheme();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('does not persist localStorage when running on server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const service = TestBed.inject(ThemeService);

    service.initTheme();
    service.toggleTheme();

    const document = TestBed.inject(DOCUMENT);
    expect(localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});


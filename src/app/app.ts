import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsService } from './core/analytics.service';
import { ThemeService } from './core/theme.service';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.analyticsService.initialize();
    this.themeService.initTheme();
  }
}

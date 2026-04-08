import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { PortfolioStatsSectionComponent } from './sections/portfolio-stats-section/portfolio-stats-section.component';
import { PresentationSectionComponent } from './sections/presentation-section/presentation-section.component';
import { ProjectsSectionComponent } from './sections/projects-section/projects-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    PresentationSectionComponent,
    PortfolioStatsSectionComponent,
    ProjectsSectionComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.sass',
})
export class HomePage {
  protected readonly themeService = inject(ThemeService);

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

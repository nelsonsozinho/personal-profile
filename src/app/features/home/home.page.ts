import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { PresentationSectionComponent } from './sections/presentation-section/presentation-section.component';
import { ProjectsSectionComponent } from './sections/projects-section/projects-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, PresentationSectionComponent, ProjectsSectionComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.sass',
})
export class HomePage {
  protected readonly themeService = inject(ThemeService);

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

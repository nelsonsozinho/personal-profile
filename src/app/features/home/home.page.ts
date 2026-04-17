import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { SeoService } from '../../core/seo.service';
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
export class HomePage implements OnInit {
  protected readonly themeService = inject(ThemeService);
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.updatePageMetadata();
    this.addStructuredData();
  }

  private updatePageMetadata(): void {
    this.seoService.updateMetadata({
      title: 'Nelson Sozinho - Backend Developer & Software Engineer',
      description:
        'Experienced software developer specializing in Java, Spring Boot, AWS, and modern web technologies. Seasoned backend engineer with expertise in microservices, event-driven architecture, and cloud-native development.',
      keywords: 'Java, Spring Boot, AWS, Backend Engineer, Full Stack Developer, Microservices, Angular',
      canonical: 'https://nelsonsozinho.dev',
      ogTitle: 'Nelson Sozinho - Full Stack Developer & Software Engineer',
      ogDescription: 'Explore my portfolio of enterprise software solutions and technical expertise.',
      ogImage: 'https://nelsonsozinho.dev/assets/profile_image.png',
      ogUrl: 'https://nelsonsozinho.dev',
      twitterTitle: 'Nelson Sozinho - Full Stack Developer',
      twitterDescription: 'Java • Spring Boot • AWS • Backend Engineering',
      twitterImage: 'https://nelsonsozinho.dev/assets/profile_image.png',
      author: 'Nelson Sozinho',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });
  }

  private addStructuredData(): void {
    // Person schema
    const personSchema = this.seoService.generatePersonSchema(
      'Nelson Sozinho',
      'Full Stack Developer with expertise in Java, Spring Boot, AWS, and modern web technologies.',
      'https://nelsonsozinho.dev',
      'https://nelsonsozinho.dev/assets/profile_image.png',
    );
    this.seoService.addStructuredData(personSchema);

    // Breadcrumb schema
    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: 'https://nelsonsozinho.dev' },
      { name: 'Portfolio', url: 'https://nelsonsozinho.dev#portfolio' },
      { name: 'Resume', url: 'https://nelsonsozinho.dev/resume' },
    ]);
    this.seoService.addStructuredData(breadcrumbSchema);
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

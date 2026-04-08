import { Component } from '@angular/core';

interface PortfolioStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-portfolio-stats-section',
  standalone: true,
  templateUrl: './portfolio-stats-section.component.html',
  styleUrl: './portfolio-stats-section.component.sass',
})
export class PortfolioStatsSectionComponent {
  protected readonly title = 'Projects Experience';

  protected readonly stats: PortfolioStat[] = [
    {
      value: '15+',
      label: 'Years of experience in software development',
    },
    {
      value: '50+',
      label: 'Github projects',
    },
    {
      value: '6+',
      label: 'Years of experience with cloud products',
    },
  ];
}


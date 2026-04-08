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
      value: '10+',
      label: 'Years in development',
    },
    {
      value: '500+',
      label: 'Clients',
    },
    {
      value: '1k+',
      label: 'Completed projects',
    },
  ];
}


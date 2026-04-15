import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

interface CompanyExperience {
  company: string;
  timeWorked: string;
  technologies: string[];
}

@Component({
  selector: 'app-resume-section',
  standalone: true,
  templateUrl: './resume-section.component.html',
  styleUrl: './resume-section.component.sass',
})
export class ResumeSectionComponent {
  private readonly location = inject(Location);

  protected readonly title = 'Resume';
  protected readonly summary =
    'Seasoned software developer with deep expertise in the Java ecosystem and AWS cloud technologies. ' +
    'Throughout my career I have designed, maintained, and optimized backend services for clients in ' +
    'finance, education, and marketing — including large-scale platforms at Itau Bank and AME Digital.';

  protected readonly highlights: string[] = [
    'Java & Spring Boot backend services with high reliability and financial-grade requirements',
    'AWS cloud-native development — Lambda, S3, SQS, Glue, CloudWatch, DynamoDB',
    'Event-driven architecture with Apache Kafka and AWS SQS at scale',
    'API design, monitoring, and deployment across microservices and legacy monoliths',
    'Delivered debit resilience components recovering ~R$5 million at Itau Bank',
    'Full-stack delivery bridging Java backends with Vue.js frontends',
  ];

  protected readonly experiences: CompanyExperience[] = [
    {
      company: 'Tenant Evaluation (Fullstack Engineer)',
      timeWorked: 'Jan 2026 - Present',
      technologies: ['Java', 'Spring Boot', 'Vue.js', 'MySQL', 'REST APIs', 'Docker'],
    },
    {
      company: 'Itau Bank (Backend Engineering)',
      timeWorked: 'Aug 2023 - Dec 2025',
      technologies: ['Java', 'Python', 'AWS Lambda', 'S3', 'Glue', 'SQS', 'Kafka'],
    },
    {
      company: 'AME Digital (Backend Engineer)',
      timeWorked: 'Aug 2022 - Jul 2023',
      technologies: [
        'Java',
        'Kotlin',
        'Spring WebFlux',
        'AWS',
        'CloudWatch',
        'CodePipeline',
        'DynamoDB',
        'Datadog',
      ],
    },
    {
      company: 'Yapstone (Backend Engineer)',
      timeWorked: 'Jan 2021 - Jun 2022',
      technologies: ['Java', 'Kotlin', 'Spring Boot', 'Feign', 'AWS Lambda', 'Couchbase'],
    },
    {
      company: 'Syngenta (Backend Engineer)',
      timeWorked: 'Sep 2020 - May 2021',
      technologies: [
        'Java',
        'Spring Boot',
        'Hibernate/JPA',
        'AWS Lambda@Edge',
        'RDS',
        'MySQL',
        'Terraform',
        'Kubernetes',
      ],
    },
    {
      company: 'FPF (Software Engineer)',
      timeWorked: 'Sep 2013 - Apr 2020',
      technologies: ['Java', 'Kotlin', 'Spring Boot', 'Python/Django', 'Angular', 'Android', 'AWS'],
    },
    {
      company: 'FUCAPI (Software Architect)',
      timeWorked: 'Dec 2011 - Aug 2013',
      technologies: ['Java', 'J2EE', 'Spring', 'Hibernate/JPA', 'SOAP', 'Oracle Database'],
    },
  ];

  protected readonly resumeFileName = 'my Resume';
  protected readonly resumeUrl = this.location.prepareExternalUrl('assets/resume-english.pdf');
}

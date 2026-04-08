import { Component } from '@angular/core';

@Component({
  selector: 'app-resume-section',
  standalone: true,
  templateUrl: './resume-section.component.html',
  styleUrl: './resume-section.component.sass',
})
export class ResumeSectionComponent {
  protected readonly title = 'Resume';
  protected readonly summary =
    'Seasoned software developer with deep expertise in the Java ecosystem and AWS cloud technologies. ' +
    'Throughout my career I have designed, maintained, and optimized backend services for clients in ' +
    'finance, education, and marketing — including large-scale platforms at Itaú Bank and AME Digital.';

  protected readonly highlights: string[] = [
    'Java & Spring Boot backend services with high reliability and financial-grade requirements',
    'AWS cloud-native development — Lambda, S3, SQS, Glue, CloudWatch, DynamoDB',
    'Event-driven architecture with Apache Kafka and AWS SQS at scale',
    'API design, monitoring, and deployment across microservices and legacy monoliths',
    'Delivered debit resilience components recovering ~R$5 million at Itaú Bank',
    'Full-stack delivery bridging Java backends with Vue.js frontends',
  ];

  protected readonly resumeFileName = 'resume-english.pdf';
  protected readonly resumeUrl = '/assets/resume-english.pdf';
}

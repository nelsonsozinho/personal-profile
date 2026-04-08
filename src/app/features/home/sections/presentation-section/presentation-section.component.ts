import { Component } from '@angular/core';

@Component({
  selector: 'app-presentation-section',
  standalone: true,
  templateUrl: './presentation-section.component.html',
  styleUrl: './presentation-section.component.sass',
})
export class PresentationSectionComponent {
  protected readonly name = 'Nelson Sozinho';
  protected readonly role = 'Backend Engineer';
  protected readonly shortBio =
    'Seasoned software developer with deep expertise in the Java ecosystem and AWS cloud technologies. ' +
    'Experienced across finance, education, and marketing industries, delivering scalable APIs, ' +
    'event-driven systems, and cloud-native solutions for clients such as Itaú Bank and AME Digital.';
}

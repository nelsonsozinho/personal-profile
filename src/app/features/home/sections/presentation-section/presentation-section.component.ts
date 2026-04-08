import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-presentation-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './presentation-section.component.html',
  styleUrl: './presentation-section.component.sass',
})
export class PresentationSectionComponent {
  protected readonly name = 'Nelson Sozinho';
  protected readonly role = 'Backend Engineer';
  protected readonly shortBio =
    'Seasoned software developer with deep expertise in the Java ecosystem and AWS cloud technologies. ' +
    'Experienced across finance, education, and marketing industries, delivering scalable APIs, ' +
    'event-driven systems, and cloud-native solutions.';

  protected readonly photoUrl = '/assets/profile_image.png';
  protected readonly email = 'nelsonsozinho@gmail.com';
  protected readonly linkedinUrl = 'https://linkedin.com/in/nelsonsozinho';
  protected readonly githubUrl = 'https://github.com/nelsonsozinho';
  protected readonly contactUrl = 'mailto:nelsonsozinho@gmail.com';
}

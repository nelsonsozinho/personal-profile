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

  protected readonly shortBio1 =
    'I’m a Senior Software Engineer. I enjoy everything related to software development, whether it’s ' +
    'code, tools, frameworks, programming languages, platforms, and more. I have extensive experience ' +
    'and am constantly seeking to improve myself in this field.';

  protected readonly shortBio2 =
    'I love learning new things, especially those that can help me in my daily life and in my profession.';

  protected readonly shortBio3 =
    'In my spare time, I also enjoy learning new things like, new technologies and challenging myself with new projects.';

  protected readonly shortBio4 =
    "I'm always open to collaboration and excited about opportunities where I can contribute, learn, and grow professionally.";

  protected readonly photoUrl = '/assets/profile_image.png';
  protected readonly email = 'nelsonsozinho@gmail.com';
  protected readonly linkedinUrl = 'https://linkedin.com/in/nelsonsozinho';
  protected readonly githubUrl = 'https://github.com/nelsonsozinho';
  protected readonly contactUrl = 'mailto:nelsonsozinho@gmail.com';
}

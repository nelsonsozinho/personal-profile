import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.sass',
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
  protected readonly author = 'Nelson Sozinho';
}


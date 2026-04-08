import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResumeSectionComponent } from '../home/sections/resume-section/resume-section.component';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [RouterLink, ResumeSectionComponent],
  templateUrl: './resume.page.html',
  styleUrl: './resume.page.sass',
})
export class ResumePage {}


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.page').then((module) => module.HomePage),
  },
  {
    path: 'resume',
    loadComponent: () =>
      import('./features/resume/resume.page').then((module) => module.ResumePage),
  },
];

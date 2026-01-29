import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home-module').then((m) => m.HomeModule),
  },
  {
    path: 'musicians',
    loadComponent: () =>
      import('./pages/musicians/musicians/musicians').then((m) => m.MusicianComponent),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./pages/students/students/students').then((m) => m.StudentComponent),
  }
];

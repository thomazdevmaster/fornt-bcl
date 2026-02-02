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
  },
  {
    path: 'presentations',
    loadComponent: () =>
      import('./pages/Presentations/presentations/presentations').then((m) => m.PresentationComponent),
  },
  {
    path: 'songs',
    loadComponent: () =>
      import('./pages/Songs/songs/songs').then((m) => m.SongComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./pages/Gallery/gallery/gallery').then((m) => m.GalleryComponent),
  },
  {
    path: 'gallery-view',
    loadComponent: () =>
      import('./pages/Gallery/GaleryView/gallery-view').then((m) => m.GalleryViewComponent),
  },
  {
    path: 'patrimony',
    loadComponent: () =>
      import('./pages/Patrimony/patrimony/patrimony').then((m) => m.PatrimonyComponent),
  },
  {
    path: 'instruments',
    loadComponent: () =>
      import('./pages/Instruments/instruments/instrument').then((m) => m.InstrumentComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];

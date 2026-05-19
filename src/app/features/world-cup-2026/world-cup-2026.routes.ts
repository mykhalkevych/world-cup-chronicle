import { Routes } from '@angular/router';

export const worldCup2026Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./world-cup-2026.component').then(m => m.WorldCup2026Component),
  },
];

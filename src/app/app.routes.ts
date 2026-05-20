import { Routes } from '@angular/router';
import { tournamentResolver } from './features/tournament/tournament.resolver';
import { playerResolver } from './features/player/player.resolver';
import { momentResolver } from './features/moment/moment.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'tournament/:year',
    loadComponent: () =>
      import('./features/tournament/tournament.component').then(m => m.TournamentComponent),
    resolve: { tournament: tournamentResolver },
  },
  {
    path: 'player/:slug',
    loadComponent: () =>
      import('./features/player/player.component').then(m => m.PlayerComponent),
    resolve: { data: playerResolver },
  },
  {
    path: 'moment/:slug',
    loadComponent: () =>
      import('./features/moment/moment.component').then(m => m.MomentComponent),
    resolve: { data: momentResolver },
  },
  {
    path: 'archive',
    loadComponent: () =>
      import('./features/archive/archive.component').then(m => m.ArchiveComponent),
  },
  {
    path: '2026',
    loadChildren: () =>
      import('./features/world-cup-2026/world-cup-2026.routes').then(m => m.worldCup2026Routes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];

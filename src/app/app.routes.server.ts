import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'tournament/:year',
    renderMode: RenderMode.Server,
  },
  {
    path: 'player/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'moment/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: '2026',
    renderMode: RenderMode.Server,
  },
  {
    path: 'archive',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

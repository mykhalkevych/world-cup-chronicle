import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const ERA_YEARS = [
  1930, 1934, 1938,
  1950, 1954, 1958,
  1962, 1966, 1970, 1974, 1978,
  1982, 1986, 1990, 1994, 1998,
  2002, 2006, 2010, 2014, 2018, 2022,
  2026,
];

@Injectable({ providedIn: 'root' })
export class EraThemeService {
  private platformId = inject(PLATFORM_ID);
  private currentEra = '';

  setEra(year: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const body = document.body;

    ERA_YEARS.forEach(y => body.classList.remove(`era-${y}`));

    if (ERA_YEARS.includes(year)) {
      body.classList.add(`era-${year}`);
      this.currentEra = `era-${year}`;
    }
  }

  getEraClass(year: number): string {
    return ERA_YEARS.includes(year) ? `era-${year}` : '';
  }

  clearEra(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    ERA_YEARS.forEach(y => document.body.classList.remove(`era-${y}`));
    this.currentEra = '';
  }

  get currentEraClass(): string {
    return this.currentEra;
  }
}

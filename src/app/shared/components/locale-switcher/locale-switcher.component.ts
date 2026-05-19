import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-locale-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="locale-switcher" role="navigation" [attr.aria-label]="'nav.language' | translate">
      @for (lang of langs; track lang.code) {
        <button
          [class.active]="currentLang === lang.code"
          (click)="switch(lang.code)"
          [attr.aria-label]="lang.label"
          [attr.aria-current]="currentLang === lang.code ? 'true' : null">
          {{ lang.code.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .locale-switcher {
      display: flex;
      gap: 0.25rem;

      button {
        background: none;
        border: 1px solid color-mix(in srgb, var(--ink-secondary) 40%, transparent);
        color: var(--ink-secondary);
        cursor: pointer;
        font-family: var(--font-meta);
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        padding: 0.15rem 0.35rem;
        transition: background 0.2s, color 0.2s;

        &:hover,
        &.active {
          background: var(--ink-color);
          color: var(--paper-bg);
          border-color: var(--ink-color);
        }
      }
    }
  `],
})
export class LocaleSwitcherComponent {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  langs = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
  ];

  get currentLang(): string {
    return this.translate.currentLang ?? 'en';
  }

  switch(lang: string): void {
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }
}

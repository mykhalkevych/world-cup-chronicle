import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { type Observable } from 'rxjs';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideTranslateService({ fallbackLang: 'en' }),
    provideTranslateHttpLoader(),
    {
      provide: APP_INITIALIZER,
      useFactory: (): () => Observable<unknown> => {
        const translate = inject(TranslateService);
        const platformId = inject(PLATFORM_ID);
        return () => {
          if (isPlatformBrowser(platformId)) {
            const saved = localStorage.getItem('lang');
            const browser = navigator.language.slice(0, 2);
            const supported = ['en', 'es', 'pt', 'fr'];
            const lang =
              supported.includes(saved ?? '') ? saved! :
              supported.includes(browser) ? browser :
              'en';
            return translate.use(lang);
          }
          return translate.use('en');
        };
      },
      multi: true,
    },
  ],
};

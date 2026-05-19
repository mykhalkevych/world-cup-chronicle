import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private translate = inject(TranslateService);
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.translate.addLangs(['en', 'es', 'pt', 'fr']);

    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang');
      const browser = navigator.language.slice(0, 2);
      const supported = ['en', 'es', 'pt', 'fr'];
      const lang = supported.includes(saved ?? '') ? saved!
                 : supported.includes(browser) ? browser
                 : 'en';
      this.translate.use(lang);
      this.analytics.init();
    } else {
      this.translate.use('en');
    }
  }
}

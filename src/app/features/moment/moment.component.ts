import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { EraThemeService } from '../../core/services/era-theme.service';
import { Moment } from '../../core/models/moment.model';
import { Clipping } from '../../core/models/clipping.model';
import { MomentPageData } from './moment.resolver';

@Component({
  selector: 'app-moment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, NewspaperClippingComponent],
  templateUrl: './moment.component.html',
  styleUrl: './moment.component.scss',
})
export class MomentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private eraTheme = inject(EraThemeService);
  private platformId = inject(PLATFORM_ID);
  moment = signal<Moment | null>(null);
  clippings = signal<Clipping[]>([]);

  ngOnInit(): void {
    const data: MomentPageData = this.route.snapshot.data['data'] ?? { moment: null, clippings: [] };
    this.moment.set(data.moment);
    this.clippings.set(data.clippings);

    if (data.moment) {
      const m = data.moment;

      this.translate
        .get('moment.pageTitle', { name: m.name })
        .subscribe(title => this.titleService.setTitle(title));

      this.meta.updateTag({ name: 'description', content: m.description.slice(0, 160) });
      this.meta.updateTag({ property: 'og:title', content: m.name });
      this.meta.updateTag({ property: 'og:description', content: m.description.slice(0, 160) });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
    } else {
      this.titleService.setTitle('Moment — The World Cup Chronicle');
    }
  }

  ngOnDestroy(): void {
    this.eraTheme.clearEra();
  }
}

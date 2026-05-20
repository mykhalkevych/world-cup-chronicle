import {
  Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { EraThemeService } from '../../core/services/era-theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Tournament } from '../../core/models/tournament.model';
import { Clipping } from '../../core/models/clipping.model';
import { TournamentPageData } from './tournament.resolver';

@Component({
  selector: 'app-tournament',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, NewspaperClippingComponent],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.scss',
})
export class TournamentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private eraTheme = inject(EraThemeService);
  private analytics = inject(AnalyticsService);

  tournament = signal<Tournament | null>(null);
  clippings = signal<Clipping[]>([]);
  featuredClipping = signal<Clipping | null>(null);

  ngOnInit(): void {
    const data = this.route.snapshot.data['tournament'] as TournamentPageData;
    if (data.tournament) {
      this.tournament.set(data.tournament);
      this.clippings.set(data.clippings);
      this.featuredClipping.set(data.clippings.find(c => c.isFeatured) ?? null);
      this.eraTheme.setEra(data.tournament.year);

      this.translate
        .get('tournament.pageTitle', { year: data.tournament.year })
        .subscribe(title => this.titleService.setTitle(title));

      this.meta.updateTag({ name: 'description', content: data.tournament.summary });
      this.meta.updateTag({ property: 'og:title', content: `${data.tournament.year} FIFA World Cup` });
      this.meta.updateTag({ property: 'og:description', content: data.tournament.summary });
      this.meta.updateTag({ property: 'og:type', content: 'article' });

      this.analytics.trackEvent('tournament-open', { year: data.tournament.year });
    }
  }

  onClippingClick(clipping: Clipping): void {
    this.analytics.trackEvent('clipping-click', {
      headline: clipping.headline,
      year: this.tournament()?.year ?? 0,
    });
  }

  ngOnDestroy(): void {
    this.eraTheme.clearEra();
  }

  get regularClippings(): Clipping[] {
    return this.clippings().filter(c => !c.isFeatured);
  }
}

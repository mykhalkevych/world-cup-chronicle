import {
  Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, DOCUMENT
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { StatsBarChartComponent, StatBar } from '../../shared/components/stats-bar-chart/stats-bar-chart.component';
import { EraThemeService } from '../../core/services/era-theme.service';
import { Tournament } from '../../core/models/tournament.model';
import { Clipping } from '../../core/models/clipping.model';
import { TournamentPageData } from './tournament.resolver';

@Component({
  selector: 'app-tournament',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, NewspaperClippingComponent, StatsBarChartComponent],
  templateUrl: './tournament.component.html',
  styleUrl: './tournament.component.scss',
})
export class TournamentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private eraTheme = inject(EraThemeService);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
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

      const { year, summary, hostCountry, champion } = data.tournament;
      const ogImage = `https://world-cup-chronicle.web.app/og/${year}.png`;

      this.meta.updateTag({ name: 'description', content: summary });
      this.meta.updateTag({ property: 'og:title', content: `${year} FIFA World Cup` });
      this.meta.updateTag({ property: 'og:description', content: summary });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      this.meta.updateTag({ property: 'og:image', content: ogImage });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:image', content: ogImage });

      if (isPlatformServer(this.platformId)) {
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: `${year} FIFA World Cup`,
          location: { '@type': 'Country', name: hostCountry },
          winner: { '@type': 'SportsTeam', name: champion },
        };
        const script = this.document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(jsonLd);
        this.document.head.appendChild(script);
      }
    }
  }

  onClippingClick(_clipping: Clipping): void {}

  ngOnDestroy(): void {
    this.eraTheme.clearEra();
  }

  get regularClippings(): Clipping[] {
    return this.clippings().filter(c => !c.isFeatured);
  }

  // Historical goals data for all 22 tournaments — used in the infographic bar chart
  private static readonly GOALS_BY_YEAR: Record<number, number> = {
    1930: 70, 1934: 70, 1938: 84, 1950: 88, 1954: 140, 1958: 126,
    1962: 89, 1966: 89, 1970: 95,  1974: 97,  1978: 102, 1982: 146,
    1986: 132, 1990: 115, 1994: 141, 1998: 171, 2002: 161, 2006: 147,
    2010: 145, 2014: 171, 2018: 169, 2022: 172,
  };

  get goalsBars(): StatBar[] {
    const t = this.tournament();
    if (!t || !t.goalsTotal) return [];
    return Object.entries(TournamentComponent.GOALS_BY_YEAR)
      .map(([year, goals]) => ({
        label: year,
        value: goals,
        highlight: Number(year) === t.year,
      }));
  }

  // Groups of 2+ clippings that share a primary tag but come from different countries
  get perspectiveGroups(): { tag: string; clippings: Clipping[] }[] {
    const groups = new Map<string, Clipping[]>();
    for (const c of this.regularClippings) {
      const tag = c.tags[0];
      if (!tag) continue;
      const group = groups.get(tag) ?? [];
      group.push(c);
      groups.set(tag, group);
    }
    return Array.from(groups.entries())
      .filter(([, clips]) => clips.length > 1 && new Set(clips.map(c => c.country)).size > 1)
      .map(([tag, clippings]) => ({ tag, clippings }));
  }

  // Clippings not part of any perspective group — shown in the regular grid
  get singleClippings(): Clipping[] {
    const inGroup = new Set(this.perspectiveGroups.flatMap(g => g.clippings.map(c => c.id)));
    return this.regularClippings.filter(c => !inGroup.has(c.id));
  }
}

import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { EraThemeService } from '../../core/services/era-theme.service';

interface TournamentEntry {
  year: number;
  host: string;
  champion: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, MastheadComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private analytics = inject(AnalyticsService);
  private eraTheme = inject(EraThemeService);

  readonly era1930s: TournamentEntry[] = [
    { year: 1930, host: 'Uruguay',     champion: '🇺🇾 Uruguay' },
    { year: 1934, host: 'Italy',       champion: '🇮🇹 Italy' },
    { year: 1938, host: 'France',      champion: '🇮🇹 Italy' },
  ];

  readonly era1950s: TournamentEntry[] = [
    { year: 1950, host: 'Brazil',      champion: '🇺🇾 Uruguay' },
    { year: 1954, host: 'Switzerland', champion: '🇩🇪 West Germany' },
    { year: 1958, host: 'Sweden',      champion: '🇧🇷 Brazil' },
  ];

  readonly era1960s70s: TournamentEntry[] = [
    { year: 1962, host: 'Chile',        champion: '🇧🇷 Brazil' },
    { year: 1966, host: 'England',      champion: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' },
    { year: 1970, host: 'Mexico',       champion: '🇧🇷 Brazil' },
    { year: 1974, host: 'West Germany', champion: '🇩🇪 West Germany' },
    { year: 1978, host: 'Argentina',    champion: '🇦🇷 Argentina' },
  ];

  readonly era1980s90s: TournamentEntry[] = [
    { year: 1982, host: 'Spain',    champion: '🇮🇹 Italy' },
    { year: 1986, host: 'Mexico',   champion: '🇦🇷 Argentina' },
    { year: 1990, host: 'Italy',    champion: '🇩🇪 West Germany' },
    { year: 1994, host: 'USA',      champion: '🇧🇷 Brazil' },
    { year: 1998, host: 'France',   champion: '🇫🇷 France' },
  ];

  readonly era2000s: TournamentEntry[] = [
    { year: 2002, host: 'Korea / Japan', champion: '🇧🇷 Brazil' },
    { year: 2006, host: 'Germany',       champion: '🇮🇹 Italy' },
    { year: 2010, host: 'South Africa',  champion: '🇪🇸 Spain' },
    { year: 2014, host: 'Brazil',        champion: '🇩🇪 Germany' },
    { year: 2018, host: 'Russia',        champion: '🇫🇷 France' },
    { year: 2022, host: 'Qatar',         champion: '🇦🇷 Argentina' },
  ];

  ngOnInit(): void {
    this.eraTheme.clearEra();
    this.translate.get('home.title').subscribe(title => {
      this.titleService.setTitle(`${title} — The World Cup Chronicle`);
    });
    this.meta.updateTag({
      name: 'description',
      content: 'The complete history of all FIFA World Cups, presented as a living newspaper archive.',
    });
  }

  onTournamentOpen(year: number): void {
    this.analytics.trackEvent('tournament-open', { year });
  }
}

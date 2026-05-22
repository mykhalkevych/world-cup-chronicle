import {
  Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { EraThemeService } from '../../core/services/era-theme.service';
import { NewsArticle } from '../../core/models/news-article.model';
import { MatchResult } from '../../core/models/match-result.model';
import { GroupStanding } from '../../core/models/group-standing.model';
import { TopScorer } from '../../core/models/top-scorer.model';
import { NewsFeedService } from './services/news-feed.service';
import { FixturesService } from './services/fixtures.service';
import { ResultsGridComponent } from './components/results-grid/results-grid.component';
import { GroupTableComponent } from './components/group-table/group-table.component';
import { TopScorersTableComponent } from './components/top-scorers-table/top-scorers-table.component';
import { KnockoutBracketComponent } from './components/knockout-bracket/knockout-bracket.component';

@Component({
  selector: 'app-world-cup-2026',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, ResultsGridComponent, GroupTableComponent, TopScorersTableComponent, KnockoutBracketComponent],
  templateUrl: './world-cup-2026.component.html',
  styleUrl: './world-cup-2026.component.scss',
})
export class WorldCup2026Component implements OnInit, OnDestroy {
  private eraTheme = inject(EraThemeService);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private newsFeed = inject(NewsFeedService);
  private fixtures = inject(FixturesService);

  articles = signal<NewsArticle[]>([]);
  tickerHeadlines = signal<string[]>([
    'USA · Canada · Mexico host the 2026 FIFA World Cup',
    'Record 48 teams compete in the expanded tournament',
    'Follow every match as it happens',
  ]);
  results = signal<MatchResult[]>([]);
  allFixtures = signal<MatchResult[]>([]);
  standings = signal<GroupStanding[]>([]);
  scorers = signal<TopScorer[]>([]);
  lastUpdatedMin = signal<number>(0);

  get featuredArticle(): NewsArticle | null {
    return this.articles().find(a => a.size === 'featured') ?? this.articles()[0] ?? null;
  }

  get gridArticles(): NewsArticle[] {
    const featured = this.featuredArticle;
    return featured ? this.articles().filter(a => a !== featured).slice(0, 6) : [];
  }

  ngOnInit(): void {
    this.eraTheme.setEra(2026);
    this.titleService.setTitle('2026 World Cup — The World Cup Chronicle');

    if (!isPlatformBrowser(this.platformId)) return;

    this.newsFeed.getNews().subscribe(articles => {
      this.articles.set(articles);
      if (articles.length) {
        this.tickerHeadlines.set(
          articles.filter(a => a.isBreaking || a.size === 'featured').map(a => a.headline).slice(0, 8)
            .concat(['USA · Canada · Mexico host the 2026 FIFA World Cup'])
        );
      }
    });

    this.fixtures.getFixtures().subscribe(results => {
      this.allFixtures.set(results);
      this.results.set(results.slice(0, 12));
      this.lastUpdatedMin.set(Math.floor(Math.random() * 5) + 1);
    });

    this.fixtures.getStandings().subscribe(standings => this.standings.set(standings));
    this.fixtures.getTopScorers().subscribe(scorers => this.scorers.set(scorers));
  }

  ngOnDestroy(): void {
    this.eraTheme.clearEra();
  }

  onTickerClick(): void {}
}

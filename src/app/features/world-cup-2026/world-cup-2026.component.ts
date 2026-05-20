import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { ScoreBoxComponent } from '../../shared/components/score-box/score-box.component';
import { EraThemeService } from '../../core/services/era-theme.service';
import { NewsArticle } from '../../core/models/news-article.model';

@Component({
  selector: 'app-world-cup-2026',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, ScoreBoxComponent],
  templateUrl: './world-cup-2026.component.html',
  styleUrl: './world-cup-2026.component.scss',
})
export class WorldCup2026Component implements OnInit, OnDestroy {
  private eraTheme = inject(EraThemeService);
  private titleService = inject(Title);

  articles = signal<NewsArticle[]>([]);
  tickerHeadlines = signal<string[]>([]);

  ngOnInit(): void {
    this.eraTheme.setEra(2026);
    this.titleService.setTitle('2026 World Cup — The World Cup Chronicle');

    // Placeholder ticker headlines until live feed is connected
    this.tickerHeadlines.set([
      'USA · Canada · Mexico host the 2026 FIFA World Cup',
      'Record 48 teams compete in the expanded tournament',
      'Follow every match as it happens',
    ]);
  }

  ngOnDestroy(): void {
    this.eraTheme.clearEra();
  }

  onTickerClick(): void {}
}

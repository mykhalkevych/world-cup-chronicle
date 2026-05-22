import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatchResult } from '../../../../core/models/match-result.model';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './results-grid.component.html',
  styleUrl: './results-grid.component.scss',
})
export class ResultsGridComponent {
  results = input<MatchResult[]>([]);
  lastUpdatedMin = input<number>(0);

  isLive(result: MatchResult): boolean {
    return result.status === 'LIVE';
  }

  formatScore(result: MatchResult): string {
    if (result.homeGoals === null || result.awayGoals === null) return 'v';
    return `${result.homeGoals} : ${result.awayGoals}`;
  }
}

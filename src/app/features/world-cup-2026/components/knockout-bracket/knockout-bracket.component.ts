import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatchResult } from '../../../../core/models/match-result.model';

interface BracketRound {
  label: string;
  matches: MatchResult[];
}

// Round names from API-Football for the 2026 World Cup knockout phase
const KNOCKOUT_ROUNDS = [
  'Round of 32',
  'Round of 16',
  'Quarter-finals',
  'Semi-finals',
  '3rd Place Final',
  'Final',
];

@Component({
  selector: 'app-knockout-bracket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './knockout-bracket.component.html',
  styleUrl: './knockout-bracket.component.scss',
})
export class KnockoutBracketComponent {
  fixtures = input<MatchResult[]>([]);

  rounds = computed<BracketRound[]>(() => {
    const all = this.fixtures();
    const map = new Map<string, MatchResult[]>();

    for (const m of all) {
      const round = m.round ?? '';
      if (!KNOCKOUT_ROUNDS.some(r => round.includes(r))) continue;
      const bucket = map.get(round) ?? [];
      bucket.push(m);
      map.set(round, bucket);
    }

    return KNOCKOUT_ROUNDS
      .map(label => ({ label, matches: map.get(label) ?? [] }))
      .filter(r => r.matches.length > 0);
  });

  formatScore(m: MatchResult): string {
    if (m.homeGoals === null || m.awayGoals === null) return 'v';
    return `${m.homeGoals} – ${m.awayGoals}`;
  }

  isLive(m: MatchResult): boolean {
    return m.status === 'LIVE';
  }
}

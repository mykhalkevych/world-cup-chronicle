import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-score-box',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="score-box" role="text" [attr.aria-label]="homeTeam() + ' vs ' + awayTeam() + ' ' + score()">
      <span class="score-box__team">{{ homeTeam() }}</span>
      <span class="score-box__score">{{ score() }}</span>
      <span class="score-box__team">{{ awayTeam() }}</span>
    </div>
  `,
  styles: [`
    .score-box {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: var(--border-style);
      padding: 0.5rem 1rem;
      font-family: var(--font-headline);
      color: var(--ink-color);

      &__team {
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__score {
        font-size: 1.5rem;
        font-weight: 900;
        padding: 0 0.5rem;
        border-left: 1px solid color-mix(in srgb, var(--ink-color) 30%, transparent);
        border-right: 1px solid color-mix(in srgb, var(--ink-color) 30%, transparent);
        min-width: 3rem;
        text-align: center;
      }
    }
  `],
})
export class ScoreBoxComponent {
  homeTeam = input.required<string>();
  awayTeam = input.required<string>();
  score = input.required<string>();
}

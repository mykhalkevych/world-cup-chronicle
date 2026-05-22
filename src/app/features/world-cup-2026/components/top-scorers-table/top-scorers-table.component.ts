import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TopScorer } from '../../../../core/models/top-scorer.model';

@Component({
  selector: 'app-top-scorers-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './top-scorers-table.component.html',
  styleUrl: './top-scorers-table.component.scss',
})
export class TopScorersTableComponent {
  scorers = input<TopScorer[]>([]);
}

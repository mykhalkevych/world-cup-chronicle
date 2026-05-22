import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export interface StatBar {
  label: string;
  value: number;
  highlight?: boolean;
}

@Component({
  selector: 'app-stats-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-bar-chart.component.html',
  styleUrl: './stats-bar-chart.component.scss',
})
export class StatsBarChartComponent {
  bars = input<StatBar[]>([]);
  title = input<string>('');
  unit = input<string>('');

  max = computed(() => Math.max(...this.bars().map(b => b.value), 1));

  widthPct(value: number): string {
    return `${Math.round((value / this.max()) * 100)}%`;
  }
}

import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GroupStanding } from '../../../../core/models/group-standing.model';

@Component({
  selector: 'app-group-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './group-table.component.html',
  styleUrl: './group-table.component.scss',
})
export class GroupTableComponent {
  standings = input<GroupStanding[]>([]);
}

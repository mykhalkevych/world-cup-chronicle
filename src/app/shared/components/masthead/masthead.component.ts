import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleSwitcherComponent } from '../locale-switcher/locale-switcher.component';

@Component({
  selector: 'app-masthead',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocaleSwitcherComponent],
  templateUrl: './masthead.component.html',
  styleUrl: './masthead.component.scss',
})
export class MastheadComponent {
  name = input<string>('The World Cup Chronicle');
  subtitle = input<string>('A Complete History of FIFA World Cups');
  edition = input<number | null>(null);
  isLive = input<boolean>(false);
}

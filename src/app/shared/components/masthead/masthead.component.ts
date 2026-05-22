import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleSwitcherComponent } from '../locale-switcher/locale-switcher.component';
import { SoundService } from '../../../core/services/sound.service';

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

  private sound = inject(SoundService);
  soundEnabled = signal(this.sound.isEnabled);

  toggleSound(): void {
    this.sound.toggle();
    this.soundEnabled.set(this.sound.isEnabled);
  }
}

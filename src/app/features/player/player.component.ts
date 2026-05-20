import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private translate = inject(TranslateService);
  player = signal<Player | null>(null);

  ngOnInit(): void {
    const p: Player | null = this.route.snapshot.data['data'];
    this.player.set(p);

    if (p) {
      this.translate
        .get('player.pageTitle', { name: p.name })
        .subscribe(title => this.titleService.setTitle(title));
    } else {
      this.titleService.setTitle('Player — The World Cup Chronicle');
    }
  }
}

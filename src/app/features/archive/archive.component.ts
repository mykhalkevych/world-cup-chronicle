import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { Clipping } from '../../core/models/clipping.model';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-archive',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, MastheadComponent, NewspaperClippingComponent],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent {
  private http = inject(HttpClient);
  private titleService = inject(Title);
  private sound = inject(SoundService);

  // Plain string for two-way ngModel binding
  queryValue = '';
  results = signal<Clipping[]>([]);
  searching = signal(false);
  searched = signal(false);

  constructor() {
    this.titleService.setTitle('Archive — The World Cup Chronicle');
  }

  async search(): Promise<void> {
    if (!this.queryValue.trim()) return;
    this.sound.typewriterClick();
    this.searching.set(true);
    const clippings = await firstValueFrom(
      this.http
        .get<Clipping[]>(`/api/search?q=${encodeURIComponent(this.queryValue)}`)
        .pipe(catchError(() => of([])))
    );
    this.results.set(clippings);
    this.searching.set(false);
    this.searched.set(true);
  }
}

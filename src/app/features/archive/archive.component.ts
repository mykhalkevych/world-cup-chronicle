import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { NotionService } from '../../core/services/notion.service';
import { Clipping } from '../../core/models/clipping.model';

@Component({
  selector: 'app-archive',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, MastheadComponent, NewspaperClippingComponent],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss',
})
export class ArchiveComponent {
  private notion = inject(NotionService);
  private titleService = inject(Title);

  query = signal('');
  results = signal<Clipping[]>([]);
  searching = signal(false);
  searched = signal(false);

  constructor() {
    this.titleService.setTitle('Archive — The World Cup Chronicle');
  }

  async search(): Promise<void> {
    const q = this.query();
    if (!q.trim()) return;

    this.searching.set(true);
    const clippings = await this.notion.searchClippings(q);
    this.results.set(clippings);
    this.searching.set(false);
    this.searched.set(true);
  }
}

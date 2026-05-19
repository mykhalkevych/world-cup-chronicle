import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';
import { NewspaperClippingComponent } from '../../shared/components/newspaper-clipping/newspaper-clipping.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Moment } from '../../core/models/moment.model';
import { Clipping } from '../../core/models/clipping.model';
import { MomentPageData } from './moment.resolver';

@Component({
  selector: 'app-moment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MastheadComponent, NewspaperClippingComponent],
  templateUrl: './moment.component.html',
  styleUrl: './moment.component.scss',
})
export class MomentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private translate = inject(TranslateService);
  private analytics = inject(AnalyticsService);

  moment = signal<Moment | null>(null);
  clippings = signal<Clipping[]>([]);

  ngOnInit(): void {
    const data: MomentPageData = this.route.snapshot.data['data'] ?? { moment: null, clippings: [] };
    this.moment.set(data.moment);
    this.clippings.set(data.clippings);

    if (data.moment) {
      this.translate
        .get('moment.pageTitle', { name: data.moment.name })
        .subscribe(title => this.titleService.setTitle(title));
      this.analytics.trackEvent('moment-open', { slug: data.moment.slug });
    } else {
      this.titleService.setTitle('Moment — The World Cup Chronicle');
    }
  }
}

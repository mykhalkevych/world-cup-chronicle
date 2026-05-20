import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { MastheadComponent } from '../../shared/components/masthead/masthead.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, MastheadComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  constructor() {
    inject(Title).setTitle('404 — Page Not Found — The World Cup Chronicle');
  }
}

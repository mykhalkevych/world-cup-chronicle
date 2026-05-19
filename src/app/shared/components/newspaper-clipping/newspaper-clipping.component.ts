import {
  Component, ChangeDetectionStrategy, input, output, HostListener
} from '@angular/core';
import { Clipping } from '../../../core/models/clipping.model';
import { BylineDatePipe } from '../../pipes/byline-date.pipe';

@Component({
  selector: 'app-newspaper-clipping',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './newspaper-clipping.component.html',
  styleUrl: './newspaper-clipping.component.scss',
})
export class NewspaperClippingComponent {
  clipping = input.required<Clipping>();
  clicked = output<Clipping>();

  // Deterministic rotation from clipping id to avoid SSR/client hydration mismatch
  get rotation(): number {
    const id = this.clipping().id;
    return (id.charCodeAt(0) % 5) - 2;
  }

  get rotationStyle(): string {
    return `rotate(${this.rotation}deg)`;
  }

  @HostListener('keydown.enter')
  onEnter(): void {
    this.clicked.emit(this.clipping());
  }
}

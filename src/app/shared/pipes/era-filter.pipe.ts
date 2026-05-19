import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'eraFilter', standalone: true })
export class EraFilterPipe implements PipeTransform {
  transform(year: number): string {
    if (year <= 1938) return 'sepia(0.9) contrast(1.15) brightness(0.88)';
    if (year <= 1958) return 'sepia(0.7) contrast(1.1) brightness(0.92)';
    if (year <= 1978) return 'sepia(0.5) contrast(1.05)';
    if (year <= 1998) return 'sepia(0.25) brightness(0.97)';
    if (year <= 2022) return 'sepia(0.08) brightness(1.0)';
    return 'none';
  }
}

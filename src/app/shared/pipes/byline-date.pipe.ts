import { Pipe, PipeTransform } from '@angular/core';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Pipe({ name: 'bylineDate', standalone: true })
export class BylineDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

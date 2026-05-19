import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';

export class TranslateServerLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
      const filePath = join(
        process.cwd(),
        'dist/world-cup-chronicle/browser/assets/i18n',
        `${lang}.json`
      );
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      return of(data);
    } catch {
      // Fallback for dev mode before build
      try {
        const filePath = join(process.cwd(), 'src/assets/i18n', `${lang}.json`);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        return of(data);
      } catch {
        return of({});
      }
    }
  }
}

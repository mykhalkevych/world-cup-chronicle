import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { NewsArticle } from '../../../core/models/news-article.model';

@Injectable({ providedIn: 'root' })
export class NewsFeedService {
  private http = inject(HttpClient);

  getNews(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>('/api/2026/news').pipe(
      catchError(() => of([]))
    );
  }
}

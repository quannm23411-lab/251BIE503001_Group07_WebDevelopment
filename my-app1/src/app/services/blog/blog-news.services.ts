// blog-news.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  category?: string;
  content?: any;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  // dùng đường dẫn tương đối
  private url = 'assets/data/blog-news.data.json';

  constructor(private http: HttpClient) {}

  getAll(): Observable<NewsItem[]> {
    return this.http.get<{ items: NewsItem[] }>(this.url).pipe(
      map(res => res.items ?? [])
    );
  }

  getById(id: string): Observable<NewsItem | null> {
    return this.getAll().pipe(
      map(items => items.find(i => i.id === id) ?? null)
    );
  }
}

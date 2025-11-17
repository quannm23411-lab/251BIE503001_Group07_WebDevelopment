// blog-offers.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface OfferItem {
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
export class OffersService {
  // dùng đường dẫn tương đối
  private url = 'assets/data/blog-offers.data.json';

  constructor(private http: HttpClient) {}

  // Lấy toàn bộ danh sách items
  getAll(): Observable<OfferItem[]> {
    return this.http.get<{ items: OfferItem[] }>(this.url).pipe(
      map(res => res.items ?? [])
    );
  }

  // Lấy theo ID
  getById(id: string): Observable<OfferItem | null> {
    return this.getAll().pipe(
      map(items => items.find(i => i.id === id) ?? null)
    );
  }
}

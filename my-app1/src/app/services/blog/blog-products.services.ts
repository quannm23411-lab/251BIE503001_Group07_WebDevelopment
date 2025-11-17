// blog-products.services.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ProductItem {
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
export class ProductsService {
  // Không nên để dấu / ở đầu
  private url = 'assets/data/blog-products.data.json';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductItem[]> {
    return this.http.get<{ items: ProductItem[] }>(this.url).pipe(
      map(res => res.items ?? [])
    );
  }

  getById(id: string): Observable<ProductItem | null> {
    return this.getAll().pipe(
      map(items => items.find(i => i.id === id) ?? null)
    );
  }
}

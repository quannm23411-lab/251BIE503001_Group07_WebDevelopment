import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private url = '/assets/data/blog-products.data.json';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<{ items: any[] }>(this.url).pipe(
      map(res => res.items || [])
    );
  }

  getById(id: string): Observable<any | null> {
    return this.getAll().pipe(
      map(items => items.find(i => i.id === id) || null)
    );
  }
}

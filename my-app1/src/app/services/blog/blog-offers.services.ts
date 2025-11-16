import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OffersService {
    private url = '/assets/data/blog-offers.data.json';

    constructor(private http: HttpClient) { }

    // Lấy toàn bộ danh sách items
    getAll(): Observable<any[]> {
        return this.http.get<{ items: any[] }>(this.url).pipe(
            map(res => res.items || [])
        );
    }

    // Lấy theo ID
    getById(id: string): Observable<any | null> {
        return this.getAll().pipe(
            map(items => items.find(i => i.id === id) || null)
        );
    }
}

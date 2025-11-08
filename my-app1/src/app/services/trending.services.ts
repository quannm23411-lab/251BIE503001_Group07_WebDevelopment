import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TrendItem {
    id: string;
    label: string;
    img?: string;
}

@Injectable({ providedIn: 'root' })
export class TrendingService {
    private _trending$ = new BehaviorSubject<TrendItem[]>([]);
    get trending$(): Observable<TrendItem[]> { return this._trending$.asObservable(); }

    // gọi 1 lần ở homepage sau khi bạn đã có topRentList
    setTrending(items: TrendItem[]) {
        this._trending$.next(items ?? []);
    }
}

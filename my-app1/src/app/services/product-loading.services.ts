import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/** Schema đúng với assets/data/products.json bạn gửi */
export interface Product {
    id: string;
    vehicleName: string;
    brandId: 'B001' | 'B002' | 'B003' | 'B004' | 'B005' | string;
    model: string;
    licensePlate: string;
    batteryCapacity: string;      // "3.5 kWh"
    rangePerCharge: number;       // 200
    vehicleType: 'Scooter' | 'Motorbike' | 'E-Bike' | 'Bicycle' | string;
    pricePerHour: number;
    pricePerDay: number;
    availabilityStatus: boolean;
    rating: number;
    discount: number;             // %
    location: string;             // "TP.HCM" | "Hà Nội" | ...
    tags?: string[];
    image: string;
    description: string;
}

/** View model đã chuẩn hóa thêm vài field hữu ích */
export interface ProductVM extends Product {
    brandName?: string;           // Vinfast/Yadea/Dat Bike/Dibao/Pega
    finalPricePerDay: number;     // đã áp dụng discount
}

/** brandId -> brandName */
const BRAND_MAP: Record<string, string> = {
    B001: 'Vinfast',
    B002: 'Yadea',
    B003: 'Dat Bike',
    B004: 'Gogoro',   // theo data của bạn
    B005: 'DK Bike'
};

const STATE_KEY = makeStateKey<Product[]>('PRODUCTS_ALL_V1');

@Injectable({ providedIn: 'root' })
export class ProductLoadingService {
    private http = inject(HttpClient);
    private ts = inject(TransferState);

    /** tải + TransferState + cache */
    private readonly products$: Observable<Product[]> = this.fetchAll().pipe(
        map(list => (Array.isArray(list) ? list : [])),
        shareReplay(1)
    );

    /** Public: trả về toàn bộ dưới dạng VM đã chuẩn hóa */
    getAll(): Observable<ProductVM[]> {
        return this.products$.pipe(map(normalizeList));
    }

    /** Public: tìm kiếm đơn giản (tên/loại/tags/brand) */
    search(keyword: string): Observable<ProductVM[]> {
        const q = (keyword ?? '').trim().toLowerCase();
        if (!q) return this.getAll();
        return this.getAll().pipe(
            map(list =>
                list.filter(p =>
                    [
                        p.vehicleName,
                        p.vehicleType,
                        p.brandName,
                        ...((p.tags as string[]) || [])
                    ]
                        .filter(Boolean)
                        .some(v => String(v).toLowerCase().includes(q))
                )
            )
        );
    }

    /** Public: filter theo thành phố (nếu bạn muốn dùng ở header sau này) */
    byCity(city: string): Observable<ProductVM[]> {
        const c = (city ?? '').trim().toLowerCase();
        if (!c) return this.getAll();
        return this.getAll().pipe(map(list => list.filter(p => p.location?.toLowerCase() === c)));
    }

    /* ---------------------------------- */

    /** SSR-friendly fetch + TransferState hydrate */
    private fetchAll(): Observable<Product[]> {
        if (this.ts.hasKey(STATE_KEY)) {
            return of(this.ts.get(STATE_KEY, [] as Product[]));
        }
        return this.http.get<Product[]>('assets/data/products.json').pipe(
            map(list => {
                try { this.ts.set(STATE_KEY, list); } catch { }
                return list;
            }),
            catchError(() => of([] as Product[]))
        );
    }
}

/* ========== helpers ========== */

function normalizeList(list: Product[]): ProductVM[] {
    return list.map(p => normalizeItem(p));
}

function normalizeItem(p: Product): ProductVM {
    const discount = clampPercent(p.discount);
    const base = Number(p.pricePerDay || 0);
    const finalPricePerDay = Math.round(base * (1 - discount / 100));

    return {
        ...p,
        id: String(p.id),
        vehicleName: p.vehicleName || 'Sản phẩm',
        image: p.image || 'assets/images/placeholder.png',
        brandName: BRAND_MAP[p.brandId] || undefined,
        finalPricePerDay
    };
}

function clampPercent(n: number): number {
    const v = Number.isFinite(n) ? n : 0;
    return Math.max(0, Math.min(100, v));
}

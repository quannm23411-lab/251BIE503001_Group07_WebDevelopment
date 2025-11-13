import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/** Chi tiết mô tả trong products.json */
export interface ProductDetails {
    title: string;
    paragraphs: string[];
    features: string[];
}

/** Schema đúng với assets/data/products.json */
export interface Product {
    id: string;
    vehicleName: string;
    brandId: 'B001' | 'B002' | 'B003' | 'B004' | 'B005' | string;
    model: string;
    licensePlate: string;
    batteryCapacity: string;
    rangePerCharge: number;
    vehicleType: 'Scooter' | 'Motorbike' | 'E-Bike' | 'Bicycle' | string;
    pricePerHour: number;
    pricePerDay: number;
    availabilityStatus: boolean;
    rating: number;
    discount: number;
    location: string;
    tags?: string[];
    image: string;
    description: string;

    /** Mô tả chi tiết cho trang product-detail */
    details?: ProductDetails;
}

/** View model đã chuẩn hóa thêm vài field hữu ích */
export interface ProductVM extends Product {
    brandName?: string;
    finalPricePerDay: number;
}

/** brandId -> brandName */
const BRAND_MAP: Readonly<Record<string, string>> = {
    B001: 'Vinfast',
    B002: 'Yadea',
    B003: 'Dat Bike',
    B004: 'Gogoro',
    B005: 'DK Bike'
} as const;

/** placeholder ảnh mặc định */
const IMG_PLACEHOLDER = 'assets/images/placeholder.png';

type ImageKind = 'card' | 'detail' | 'thumb';

@Injectable({ providedIn: 'root' })
export class ProductLoadingService {
    private http = inject(HttpClient);
    private ts = inject(TransferState);

    private static readonly STATE_KEY = makeStateKey<ProductVM[]>('PRODUCTS_VM_V2');

    /** Cache + SSR hydratation */
    private readonly vm$: Observable<ProductVM[]> = this.loadVM();

    /** ====== Public APIs ====== */

    getAll(): Observable<ProductVM[]> {
        return this.vm$;
    }

    search(keyword: string): Observable<ProductVM[]> {
        const q = (keyword ?? '').trim().toLowerCase();
        if (!q) return this.vm$;

        return this.vm$.pipe(
            map(list =>
                list.filter(p =>
                    [p.vehicleName, p.vehicleType, p.brandName, ...(p.tags ?? [])]
                        .filter(Boolean)
                        .some(v => String(v).toLowerCase().includes(q))
                )
            )
        );
    }

    byCity(city: string): Observable<ProductVM[]> {
        const c = (city ?? '').trim();
        if (!c) return this.vm$;
        const norm = (s: string) =>
            s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const nc = norm(c);
        return this.vm$.pipe(
            map(list => list.filter(p => norm(p.location ?? '') === nc))
        );
    }

    getById(id: string): Observable<ProductVM | undefined> {
        return this.vm$.pipe(map(list => list.find(x => x.id === String(id))));
    }

    getByIds(ids: string[]): Observable<ProductVM[]> {
        const set = new Set(ids.map(String));
        return this.vm$.pipe(map(list => list.filter(x => set.has(x.id))));
    }

    /** ====== Ảnh & hiển thị ====== */

    getImageUrl(p: { image?: string }, _kind: ImageKind = 'card'): string {
        return p?.image || IMG_PLACEHOLDER;
    }

    getImageSize(kind: ImageKind = 'card') {
        switch (kind) {
            case 'detail':
                return { w: 960, h: 640 };
            case 'thumb':
                return { w: 120, h: 80 };
            default:
                return { w: 480, h: 320 };
        }
    }

    /** ====== Private ====== */

    private loadVM(): Observable<ProductVM[]> {
        if (this.ts.hasKey(ProductLoadingService.STATE_KEY)) {
            return of(this.ts.get(ProductLoadingService.STATE_KEY, [] as ProductVM[]));
        }

        return this.http.get<Product[]>('assets/data/products.json').pipe(
            map(normalizeList),
            map(list => {
                try {
                    this.ts.set(ProductLoadingService.STATE_KEY, list);
                } catch {
                    // ignore TransferState error
                }
                return list;
            }),
            catchError(() => of([] as ProductVM[])),
            shareReplay(1)
        );
    }
}

/* ================== Helpers ================== */

function normalizeList(list: Product[]): ProductVM[] {
    return list.map(p => normalizeItem(p));
}

function normalizeItem(p: Product): ProductVM {
    const discount = clampPercent(p.discount);
    const base = Number.isFinite(p.pricePerDay) ? Number(p.pricePerDay) : 0;
    const finalPricePerDay = Math.round(base * (1 - discount / 100));

    return {
        ...p, // giữ details, tags... y nguyên
        id: String(p.id),
        vehicleName: p.vehicleName || 'Sản phẩm',
        image: p.image || IMG_PLACEHOLDER,
        brandName: BRAND_MAP[p.brandId] || undefined,
        finalPricePerDay
    };
}

function clampPercent(n: number): number {
    const v = Number.isFinite(n) ? n : 0;
    return Math.max(0, Math.min(100, v));
}

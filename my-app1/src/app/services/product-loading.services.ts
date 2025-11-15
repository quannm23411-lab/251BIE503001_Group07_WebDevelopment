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
    brandId: 'B001' | 'B002' | 'B003' | 'B004' | 'B005' | 'B006' | string;
    model: string;
    licensePlate: string;
    batteryCapacity: string;
    rangePerCharge: number;
    // đã đổi sang tiếng Việt
    vehicleType: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn' | string;
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

    /** phòng khi JSON có thêm */
    images?: string[];
}

/** View model đã chuẩn hóa thêm vài field hữu ích */
export interface ProductVM extends Product {
    brandName?: string;
    finalPricePerDay: number;
}

/** brandId -> brandName (theo DB hiện tại) */
const BRAND_MAP: Readonly<Record<string, string>> = {
    B001: 'VinFast',
    B002: 'Yadea',
    B003: 'DKBike',
    B004: 'Dat Bike',
    B005: 'Gogoro',
    B006: 'G-FORCE'
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

    getImageUrl(
        p: { image?: string; images?: string[] },
        _kind: ImageKind = 'card'
    ): string {
        if (p?.image) return p.image;
        if (Array.isArray(p?.images) && p.images.length) return p.images[0];
        return IMG_PLACEHOLDER;
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

    /** Text hiển thị dòng loại xe trong card / detail */
    getVehicleTypeLabel(vehicleType: string): string {
        const raw = (vehicleType ?? '').trim();
        if (!raw) return 'Dòng xe khác';

        // Trường hợp mới: DB đã lưu TV sẵn → xài luôn
        if (
            raw === 'Xe máy điện' ||
            raw === 'Xe đạp điện' ||
            raw === 'Xe đạp điện gấp gọn'
        ) {
            return raw;
        }

        // Trường hợp cũ lỡ còn sót
        const lower = raw.toLowerCase();
        if (lower === 'motorbike' || lower === 'scooter') return 'Xe máy điện';
        if (lower === 'e-bike' || lower === 'bicycle') return 'Xe đạp điện';

        // fallback: trả nguyên string
        return raw;
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
    return (list ?? []).map(p => normalizeItem(p));
}

function normalizeItem(p: Product): ProductVM {
    const discount = clampPercent(p.discount);
    const base = Number.isFinite(p.pricePerDay) ? Number(p.pricePerDay) : 0;
    const finalPricePerDay = Math.round(base * (1 - discount / 100));

    // chọn ảnh chính: image → images[0] → placeholder
    const mainImage =
        p.image ||
        (Array.isArray(p.images) && p.images.length ? p.images[0] : IMG_PLACEHOLDER);

    return {
        ...p,
        id: String(p.id),
        vehicleName: p.vehicleName || 'Sản phẩm',
        image: mainImage,
        brandName: BRAND_MAP[p.brandId] || undefined,
        // đảm bảo lấy đúng từ JSON, có fallback
        rangePerCharge: Number(p.rangePerCharge) || 0,
        rating: clampRating(p.rating),
        finalPricePerDay
    };
}

function clampPercent(n: number): number {
    const v = Number.isFinite(n as number) ? Number(n) : 0;
    return Math.max(0, Math.min(100, v));
}

function clampRating(n: number): number {
    const v = Number.isFinite(n as number) ? Number(n) : 0;
    return Math.max(0, Math.min(5, v));
}

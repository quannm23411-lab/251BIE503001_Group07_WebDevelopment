// src/app/services/hot-product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, of, shareReplay, catchError } from 'rxjs';

/* ========= Shared Models ========= */
export interface Product {
    id: string;
    vehicleName: string;
    brandId: string;
    model: string;
    licensePlate: string;
    batteryCapacity: string;
    rangePerCharge: number;
    vehicleType: string;

    pricePerHour: number;
    pricePerDay: number;

    availabilityStatus: boolean;
    rating: number;
    discount: number;
    location: string;

    tags: string[];
    image: string;
    description: string;

    details: {
        title: string;
        paragraphs: string[];
        features: string[];
    };
}

/** Cấu hình hot products – tách riêng trong assets/data/hot-products.json */
export interface HotProductsConfig {
    hero: string[];
    sections: {
        motorbike: { title: string; subtitle: string; items: string[]; limit: number };
        ebike: { title: string; subtitle: string; items: string[]; limit: number };
        compact: { title: string; subtitle: string; items: string[]; limit: number };
    };
    promo?: { code: string; discountAmount: string; endDate: string; active: boolean };
    fallbackRules: {
        motorbikeTypes: string[];
        ebikeTypes: string[];
        compactTags: string[];
    };
}

/* ========= Local utils ========= */
const norm = (v: string) => (v ?? '').toString().trim().toUpperCase();

function mapIds(ids: string[] = [], products: Product[], limit?: number): Product[] {
    const idSet = new Set(ids.map(norm));
    const pool = products.filter(p => idSet.has(norm(p.id)));
    const ordered = ids
        .map(norm)
        .map(id => pool.find(p => norm(p.id) === id))
        .filter(Boolean) as Product[];
    return typeof limit === 'number' ? ordered.slice(0, limit) : ordered;
}

function fillFallback(
    current: Product[],
    predicate: (p: Product) => boolean,
    products: Product[],
    limit: number
): Product[] {
    if (current.length >= limit) return current.slice(0, limit);
    const remain = limit - current.length;
    const pool = products.filter(predicate).filter(p => !current.some(c => c.id === p.id));
    return current.concat(pool.slice(0, remain));
}

/* ========= Service ========= */
@Injectable({ providedIn: 'root' })
export class HotProductService {
    private http = inject(HttpClient);

    /** Cache products + hot config */
    private products$ = this.http
        .get<Product[]>('assets/data/products.json')
        .pipe(shareReplay(1));

    /** Đọc từ hot-products.json*/
    private config$ = this.http
        .get<HotProductsConfig>('assets/data/hot-products.json')
        .pipe(catchError(() => of(null as unknown as HotProductsConfig)), shareReplay(1));

    /* Expose nếu nơi khác cần */
    getAllProducts() { return this.products$; }
    getConfig() { return this.config$; }
    getPromo() {
        return this.config$.pipe(
            map(cfg => cfg?.promo && cfg.promo.active ? cfg.promo : null)
        );
    }

    /** Top thuê nhiều (hero) – mặc định 4 item */
    getTopRent(limit = 4) {
        return combineLatest([this.products$, this.config$]).pipe(
            map(([products, cfg]) => {
                if (!cfg?.hero?.length) {
                    return [...products]
                        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                        .slice(0, limit);
                }
                const ordered = mapIds(cfg.hero, products, limit);
                return ordered.length
                    ? ordered
                    : [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, limit);
            })
        );
    }

    /** Hot theo nhóm – ‘motorbike’ | ‘ebike’ | ‘compact’ */
    getHotByCategory(kind: 'motorbike' | 'ebike' | 'compact', limit = 4) {
        return combineLatest([this.products$, this.config$]).pipe(
            map(([products, cfg]) => {
                // Fallback rule mặc định nếu không có config
                const fallback = {
                    motor: (p: Product) => ['Motorbike', 'Scooter'].includes(p.vehicleType),
                    ebike: (p: Product) =>
                        ['E-Bike', 'Bicycle', 'Electric Bicycle'].includes(p.vehicleType) ||
                        (p.tags?.some(t => ['eco', 'student'].includes(t)) ?? false),
                    fold: (p: Product) => p.tags?.some(t => ['compact', 'foldable'].includes(t)) ?? false
                };

                if (!cfg) {
                    if (kind === 'motorbike') return products.filter(fallback.motor).slice(0, limit);
                    if (kind === 'ebike') return products.filter(fallback.ebike).slice(0, limit);
                    return products.filter(fallback.fold).slice(0, limit);
                }

                // Có config: lấy danh sách ưu tiên, sau đó bù theo rule
                const section = cfg.sections[kind];
                const pre = mapIds(section?.items ?? [], products, limit);

                const isMotor = (p: Product) => cfg.fallbackRules.motorbikeTypes.includes(p.vehicleType);
                const isEBike = (p: Product) =>
                    cfg.fallbackRules.ebikeTypes.includes(p.vehicleType) ||
                    (p.tags?.some(t => ['eco', 'student'].includes(t)) ?? false);
                const isFold = (p: Product) => p.tags?.some(t => cfg.fallbackRules.compactTags.includes(t)) ?? false;

                const rule = kind === 'motorbike' ? isMotor : kind === 'ebike' ? isEBike : isFold;
                return fillFallback(pre, rule, products, limit);
            })
        );
    }

    /** Search client-side để gợi ý trong search bar (demo) */
    searchProducts(query: string) {
        const q = (query ?? '').trim().toLowerCase();
        if (!q) return this.products$;
        return this.products$.pipe(
            map(list =>
                list.filter(p =>
                    p.vehicleName.toLowerCase().includes(q) ||
                    p.vehicleType.toLowerCase().includes(q) ||
                    (p.tags ?? []).some(t => t.toLowerCase().includes(q))
                )
            )
        );
    }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductLoadingService, ProductVM } from '../../services/product-loading.services';

type SortKey = 'popular' | 'newest' | 'price_asc' | 'price_desc';

const TYPE_MAP: Record<string, string[]> = {
    'Xe máy điện': ['Motorbike', 'Scooter'],
    'Xe đạp điện': ['E-Bike', 'Bicycle', 'Electric Bicycle'],
    'Xe đạp điện gấp gọn': [] // nhận diện qua tags 'compact' hoặc 'foldable'
};

@Component({
    selector: 'app-rent',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './rent.html',
    styleUrls: ['./rent.css']
})
export class RentPage {
    private svc = inject(ProductLoadingService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    /** cho template dùng trực tiếp helper của service (type label, image...) */
    public productService = this.svc;

    /** Danh sách toàn bộ sản phẩm (ProductVM đã normalize) */
    all = signal<ProductVM[]>([]);

    /** State filter / sort / pagination */
    q = signal<string>('');                         // keyword
    selectedTypes = signal<Set<string>>(new Set()); // "Xe máy điện", ...
    selectedBrands = signal<Set<string>>(new Set());// Vinfast, Yadea, ...
    maxPrice = signal<number>(500_000);             // slider
    sortKey = signal<SortKey>('popular');           // mặc định: phổ biến
    pageSize = 12;
    page = signal(1);

    constructor() {
        // nạp data (SSR-friendly, cache từ TransferState)
        this.svc.getAll().subscribe(list => this.all.set(list || []));

        // đọc query param ?q=... để sync với header search
        this.route.queryParamMap.subscribe(p => {
            const q = (p.get('q') || '').trim();
            if (q !== this.q()) {
                this.q.set(q);
                this.page.set(1);
            }
            const pg = +(p.get('page') || '1');
            if (pg > 0) this.page.set(pg);
        });
    }

    /** PIPELINE FILTER + SORT */
    filtered = computed<ProductVM[]>(() => {
        const list = this.all();
        if (!list.length) return [];

        const q = this.q().toLowerCase();
        const types = this.selectedTypes();
        const brands = this.selectedBrands();
        const priceCap = this.maxPrice();

        let out = list.slice();

        // Keyword search (tên / loại / tags / thương hiệu) – dùng field đã normalize của service
        if (q) {
            out = out.filter(p =>
                [p.vehicleName, p.vehicleType, p.brandName, ...(p.tags || [])]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(q))
            );
        }

        // Lọc theo loại xe (dùng TYPE_MAP + tags từ JSON)
        if (types.size) {
            out = out.filter(p => {
                const foldTag = (p.tags || []).some(t =>
                    ['compact', 'foldable'].includes(String(t).toLowerCase())
                );
                for (const label of types) {
                    if (label === 'Xe đạp điện gấp gọn' && foldTag) return true;
                    const accept = TYPE_MAP[label] || [];
                    if (accept.includes(p.vehicleType)) return true;
                }
                return false;
            });
        }

        // Lọc theo thương hiệu (brandName đã map từ service)
        if (brands.size) {
            out = out.filter(p => p.brandName && brands.has(p.brandName));
        }

        // Giới hạn giá (pricePerDay là giá gốc, finalPricePerDay service đã tính)
        out = out.filter(p => p.pricePerDay <= priceCap);

        // Sort
        switch (this.sortKey()) {
            case 'price_asc':
                out.sort((a, b) => a.pricePerDay - b.pricePerDay);
                break;
            case 'price_desc':
                out.sort((a, b) => b.pricePerDay - a.pricePerDay);
                break;
            case 'newest':
                out.sort((a: any, b: any) =>
                    (b.createdAt || 0) - (a.createdAt || 0) || b.discount - a.discount
                );
                break;
            default: // popular
                out.sort(
                    (a, b) =>
                        b.discount - a.discount ||
                        Number(b.availabilityStatus) - Number(a.availabilityStatus)
                );
        }

        return out;
    });

    /** Phân trang */
    total = computed(() => this.filtered().length);
    totalPages = computed(() =>
        Math.max(1, Math.ceil(this.total() / this.pageSize))
    );
    topRentList = computed(() => {
        const start = (this.page() - 1) * this.pageSize;
        return this.filtered().slice(start, start + this.pageSize);
    });

    /* ---------- EVENT HANDLERS ---------- */

    toggleType(
        label: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn',
        checked: boolean
    ) {
        const s = new Set(this.selectedTypes());
        checked ? s.add(label) : s.delete(label);
        this.selectedTypes.set(s);
        this.page.set(1);
    }

    toggleBrand(name: string, checked: boolean) {
        const s = new Set(this.selectedBrands());
        checked ? s.add(name) : s.delete(name);
        this.selectedBrands.set(s);
        this.page.set(1);
    }

    onPrice(val: string | number) {
        const n = typeof val === 'number' ? val : parseInt(val as string, 10) || 0;
        this.maxPrice.set(n);
        this.page.set(1);
    }

    setSort(k: SortKey) {
        this.sortKey.set(k);
        this.page.set(1);
    }

    goto(n: number) {
        if (n < 1 || n > this.totalPages()) return;
        this.page.set(n);
        this.router.navigate([], {
            queryParams: { page: n },
            queryParamsHandling: 'merge'
        });
    }

    /** Định dạng tiền Việt Nam */
    formatVND(n: number) {
        try {
            return n.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
            });
        } catch {
            return `${n}đ`;
        }
    }
}

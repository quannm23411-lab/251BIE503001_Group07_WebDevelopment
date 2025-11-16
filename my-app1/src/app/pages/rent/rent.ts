import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
    ProductLoadingService,
    ProductVM
} from '../../services/product-loading.services';
import { RentalDatesService } from '../../services/rental-dates.services';
import { HotProductService } from '../../services/hot-products.services';

type SortKey = 'popular' | 'newest' | 'price_asc' | 'price_desc';
type RentMode = 'day' | 'week' | 'month';

// Map query param -> nhãn checkbox
const QUERY_TYPE_MAP: Record<string, string> = {
    'xe-may-dien': 'Xe máy điện',
    'xe-dap-dien': 'Xe đạp điện',
    'xe-dap-dien-gap-gon': 'Xe đạp điện gấp gọn'
};

// Map nhãn -> slug (dùng khi build queryParams đi sang detail / breadcrumb)
const TYPE_SLUG_MAP: Record<string, string> = {
    'Xe máy điện': 'xe-may-dien',
    'Xe đạp điện': 'xe-dap-dien',
    'Xe đạp điện gấp gọn': 'xe-dap-dien-gap-gon'
};

@Component({
    selector: 'app-rent',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './rent.html',
    styleUrls: ['./rent.css']
})
export class RentPage {
    public productService!: ProductLoadingService;

    all = signal<ProductVM[]>([]);

    q = signal<string>('');
    selectedTypes = signal<Set<string>>(new Set());
    selectedBrands = signal<Set<string>>(new Set());
    minPrice = signal<number>(0);
    maxPrice = signal<number>(500_000);
    sortKey = signal<SortKey>('popular');
    pageSize = 12;
    page = signal(1);

    rentMode = signal<RentMode>('day');
    startDate = signal<string>('');
    endDate = signal<string>('');
    todayStr = this.toInputDate(new Date());

    showPriceMenu = signal(false);
    showRentModeMenu = signal(false);
    cityNotice = signal<string>('');

    /** map id -> điểm phổ biến, lấy theo topRent của homepage */
    private popularityMap = new Map<string, number>();

    constructor(
        private svc: ProductLoadingService,
        private hot: HotProductService,
        private route: ActivatedRoute,
        private router: Router,
        private rentalDates: RentalDatesService
    ) {
        this.svc.getAll().subscribe(list => this.all.set(list || []));

        // đồng bộ "phổ biến" với homepage
        this.hot.getTopRent(50).subscribe(list => {
            list.forEach((p, idx) => {
                this.popularityMap.set(String(p.id), 1000 - idx); // id ở đầu list điểm cao hơn
            });
        });

        const saved = this.rentalDates.range();
        const savedStart = saved.start;
        const baseStart = savedStart || this.todayStr;
        this.startDate.set(baseStart);
        this.endDate.set(this.calcMinEndDate(this.rentMode(), baseStart));

        this.route.queryParamMap.subscribe(p => {
            const q = (p.get('q') || '').trim();
            if (q !== this.q()) {
                this.q.set(q);
                this.page.set(1);
            }

            const pg = +(p.get('page') || '1');
            if (pg > 0) this.page.set(pg);

            // ?type=xe-may-dien | xe-dap-dien | xe-dap-dien-gap-gon
            const typeParam = p.get('type');
            if (typeParam && QUERY_TYPE_MAP[typeParam]) {
                const label = QUERY_TYPE_MAP[typeParam];
                const set = new Set<string>();
                set.add(label);
                this.selectedTypes.set(set);
                this.page.set(1);
            }

            const startParam = p.get('start');
            const endParam = p.get('end');

            if (startParam) {
                const d = this.parseDate(startParam);
                if (d) {
                    const s = this.toInputDate(d);
                    this.startDate.set(s);
                }
            }

            if (endParam) {
                const d = this.parseDate(endParam);
                if (d) {
                    const e = this.toInputDate(d);
                    this.endDate.set(e);
                }
            }

            this.rentalDates.setRange(this.startDate(), this.endDate());
        });

        this.productService = this.svc;
    }

    priceSortLabel = computed(() => {
        switch (this.sortKey()) {
            case 'price_asc':
                return 'Giá thấp - cao';
            case 'price_desc':
                return 'Giá cao - thấp';
            default:
                return 'Giá';
        }
    });

    rentModeLabel = computed(() => {
        switch (this.rentMode()) {
            case 'week':
                return 'Thuê theo tuần';
            case 'month':
                return 'Thuê theo tháng';
            default:
                return 'Thuê theo ngày';
        }
    });

    filtered = computed<ProductVM[]>(() => {
        const list = this.all();
        if (!list.length) return [];

        const q = this.q().toLowerCase();
        const types = this.selectedTypes();
        const brands = this.selectedBrands();
        const min = this.minPrice();
        const max = this.maxPrice();
        let out = list.slice();

        if (q) {
            out = out.filter(p =>
                [p.vehicleName, p.vehicleType, p.brandName, ...(p.tags || [])]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(q))
            );
        }

        // lọc theo loại xe (không theo tag nữa)
        if (types.size) {
            out = out.filter(p => {
                const normalizedType = this.productService.getVehicleTypeLabel(
                    p.vehicleType ?? ''
                );
                return types.has(normalizedType);
            });
        }

        if (brands.size) {
            out = out.filter(p => p.brandName && brands.has(p.brandName));
        }

        out = out.filter(p => p.pricePerDay >= min && p.pricePerDay <= max);

        switch (this.sortKey()) {
            case 'price_asc':
                out.sort((a, b) => a.pricePerDay - b.pricePerDay);
                break;
            case 'price_desc':
                out.sort((a, b) => b.pricePerDay - a.pricePerDay);
                break;
            case 'newest':
                out.sort(
                    (a: any, b: any) =>
                        (b.createdAt || 0) - (a.createdAt || 0) || b.discount - a.discount
                );
                break;
            default:
                // phổ biến: dùng cùng logic nguồn với homepage
                out.sort((a, b) => {
                    const pa = this.getPopularity(a);
                    const pb = this.getPopularity(b);
                    return (
                        pb - pa ||
                        b.discount - a.discount ||
                        (b.rating || 0) - (a.rating || 0)
                    );
                });
        }

        // đẩy xe hết hàng xuống cuối nhưng vẫn giữ thứ tự phổ biến bên trên
        const available = out.filter(p => p.availabilityStatus !== false);
        const soldOut = out.filter(p => p.availabilityStatus === false);
        out = [...available, ...soldOut];

        return out;
    });

    total = computed(() => this.filtered().length);
    totalPages = computed(() =>
        Math.max(1, Math.ceil(this.total() / this.pageSize))
    );

    topRentList = computed(() => {
        const start = (this.page() - 1) * this.pageSize;
        return this.filtered().slice(start, start + this.pageSize);
    });

    // ----- EVENT -----
    toggleType(
        label: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn',
        checked: boolean
    ) {
        const s = new Set(this.selectedTypes());
        checked ? s.add(label) : s.delete(label);
        this.selectedTypes.set(s);
        this.page.set(1);
    }

    isTypeSelected(
        label: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn'
    ): boolean {
        return this.selectedTypes().has(label);
    }

    toggleBrand(name: string, checked: boolean) {
        const s = new Set(this.selectedBrands());
        checked ? s.add(name) : s.delete(name);
        this.selectedBrands.set(s);
        this.page.set(1);
    }

    // vẫn giữ hàm min để sau này muốn chơi dual-range thì xài lại
    onMinPriceChange(val: string | number) {
        const n =
            typeof val === 'number' ? val : parseInt(val as string, 10) || 0;
        const clamped = Math.max(0, Math.min(n, this.maxPrice()));
        this.minPrice.set(clamped);
        this.page.set(1);
    }

    onMaxPriceChange(val: string | number) {
        const n =
            typeof val === 'number' ? val : parseInt(val as string, 10) || 0;
        const clamped = Math.min(500_000, Math.max(n, this.minPrice()));
        this.maxPrice.set(clamped);
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

    /** slug loại xe cho 1 sản phẩm */
    private buildTypeSlug(p: ProductVM): string | undefined {
        const label = this.productService.getVehicleTypeLabel(p.vehicleType ?? '');
        return TYPE_SLUG_MAP[label];
    }

    /** query params khi click sang trang chi tiết */
    buildQueryParamsFor(p: ProductVM) {
        const base = this.buildDateParams();
        const type = this.buildTypeSlug(p);
        return type ? { ...base, type } : base;
    }

    goToDetail(p: ProductVM) {
        const params = this.buildQueryParamsFor(p);

        this.router.navigate(['/rent', p.id], {
            queryParams: params
        });
    }

    // ----- Thuê theo ngày / tuần / tháng -----
    toggleRentModeMenu() {
        this.showRentModeMenu.update(v => !v);
    }

    setRentMode(mode: RentMode) {
        this.rentMode.set(mode);

        const start = this.startDate() || this.todayStr;
        const normalizedStart = this.toInputDate(
            this.parseDate(start) || new Date(this.todayStr)
        );
        this.startDate.set(normalizedStart);
        const newEnd = this.calcMinEndDate(mode, normalizedStart);
        this.endDate.set(newEnd);

        this.rentalDates.setRange(normalizedStart, newEnd);
        this.showRentModeMenu.set(false);
    }

    onStartDateChange(raw: string) {
        const today = this.parseDate(this.todayStr)!;
        let d = this.parseDate(raw);

        if (!d || d < today) d = today;

        const startStr = this.toInputDate(d);
        this.startDate.set(startStr);

        const minEnd = this.calcMinEndDate(this.rentMode(), startStr);
        const curEnd = this.parseDate(this.endDate());
        const minEndDate = this.parseDate(minEnd)!;

        if (!curEnd || curEnd <= d || curEnd < minEndDate) {
            this.endDate.set(minEnd);
        }

        this.rentalDates.setRange(this.startDate(), this.endDate());
    }

    onEndDateChange(raw: string) {
        const startStr = this.startDate() || this.todayStr;
        const start = this.parseDate(startStr)!;

        let end = this.parseDate(raw);
        const minEndStr = this.calcMinEndDate(this.rentMode(), startStr);
        const minEnd = this.parseDate(minEndStr)!;

        if (!end || end <= start || end < minEnd) {
            end = minEnd;
        }

        const endStr = this.toInputDate(end);
        this.endDate.set(endStr);
        this.rentalDates.setRange(startStr, endStr);
    }

    onCityChange(_: string) {
        if (typeof window !== 'undefined') {
            alert('Tính năng lọc theo khu vực đang được phát triển.');
        }
    }

    togglePriceMenu() {
        this.showPriceMenu.update(v => !v);
    }

    closePriceMenu() {
        this.showPriceMenu.set(false);
    }

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

    // ----- Helpers -----
    private getPopularity(p: ProductVM): number {
        const id = String(p.id);
        if (this.popularityMap.has(id)) {
            return this.popularityMap.get(id)!;
        }

        const anyP: any = p;
        const base =
            anyP.totalRentals ??
            anyP.rentalCount ??
            anyP.popularityScore ??
            0;

        return base || p.rating || 0;
    }

    private toInputDate(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    private parseDate(str: string | null | undefined): Date | null {
        if (!str) return null;
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    private calcMinEndDate(mode: RentMode, startStr: string): string {
        const base = this.parseDate(startStr) || new Date(this.todayStr);
        const d = new Date(base.getTime());

        if (mode === 'week') {
            d.setDate(d.getDate() + 7);
            return this.toInputDate(d);
        }

        if (mode === 'month') {
            const startDay = d.getDate();
            d.setMonth(d.getMonth() + 1);

            if (d.getDate() < startDay) {
                d.setDate(0);
            }
            return this.toInputDate(d);
        }

        d.setDate(d.getDate() + 1);
        return this.toInputDate(d);
    }

    buildDateParams() {
        const start = this.startDate() || this.todayStr;
        const end =
            this.endDate() || this.calcMinEndDate(this.rentMode(), start);
        return { start, end };
    }
}

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
    ProductLoadingService,
    ProductVM
} from '../../services/product-loading.services';
import { RentalDatesService } from '../../services/rental-dates.services';

type SortKey = 'popular' | 'newest' | 'price_asc' | 'price_desc';
type RentMode = 'day' | 'week' | 'month';

// Map query param -> nhãn checkbox
const QUERY_TYPE_MAP: Record<string, string> = {
    'xe-may-dien': 'Xe máy điện',
    'xe-dap-dien': 'Xe đạp điện',
    'xe-dap-dien-gap-gon': 'Xe đạp điện gấp gọn'
};

// Map nhãn -> slug
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

    // SIGNALS
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

    showRentModeMenu = signal(false);
    cityNotice = signal<string>('');

    constructor(
        private svc: ProductLoadingService,
        private route: ActivatedRoute,
        private router: Router,
        private rentalDates: RentalDatesService
    ) {
        // lấy tất cả SP
        this.svc.getAll().subscribe(list => this.all.set(list || []));

        // ========== ngày thuê mặc định ==========
        const saved = this.rentalDates.range();
        const savedStart = saved.start;
        const baseStart = savedStart || this.todayStr;
        this.startDate.set(baseStart);
        this.endDate.set(this.calcMinEndDate(this.rentMode(), baseStart));

        // ========== đọc query params ==========
        this.route.queryParamMap.subscribe(p => {
            const q = (p.get('q') || '').trim();
            if (q !== this.q()) {
                this.q.set(q);
                this.page.set(1);
            }

            const pg = +(p.get('page') || '1');
            if (pg > 0) this.page.set(pg);

            // type
            const typeParam = p.get('type');
            if (typeParam && QUERY_TYPE_MAP[typeParam]) {
                const label = QUERY_TYPE_MAP[typeParam];
                const set = new Set<string>();
                set.add(label);
                this.selectedTypes.set(set);
                this.page.set(1);
            }

            // date via query
            const startParam = p.get('start');
            const endParam = p.get('end');

            if (startParam) {
                const d = this.parseDate(startParam);
                if (d) this.startDate.set(this.toInputDate(d));
            }

            if (endParam) {
                const d = this.parseDate(endParam);
                if (d) this.endDate.set(this.toInputDate(d));
            }

            this.rentalDates.setRange(this.startDate(), this.endDate());
        });

        this.productService = this.svc;
    }

    // ========================================================================
    // LABELS
    // ========================================================================

    priceSortLabel = computed(() => {
        switch (this.sortKey()) {
            case 'price_asc':
                return 'Giá ↑'; // <-- SỬA LẠI
            case 'price_desc':
                return 'Giá ↓'; // <-- SỬA LẠI
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

    // ========================================================================
    // FILTERING
    // ========================================================================

    filtered = computed<ProductVM[]>(() => {
        let out = this.all().slice();
        if (!out.length) return [];

        const q = this.q().toLowerCase();
        const types = this.selectedTypes();
        const brands = this.selectedBrands();
        const min = this.minPrice();
        const max = this.maxPrice();

        // search keyword
        if (q) {
            out = out.filter(p =>
                [p.vehicleName, p.vehicleType, p.brandName, ...(p.tags || [])]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(q))
            );
        }

        // FILTER loại xe đúng chuẩn, KHÔNG dùng tag
        if (types.size) {
            out = out.filter(p => {
                const raw = (p.vehicleType || '').trim();
                const norm = this.productService.getVehicleTypeLabel(raw);
                return types.has(norm);
            });
        }

        // brand
        if (brands.size) {
            out = out.filter(p => p.brandName && brands.has(p.brandName));
        }

        // price
        out = out.filter(p => p.pricePerDay >= min && p.pricePerDay <= max);

        // sorting
        switch (this.sortKey()) {
            case 'price_asc':
                out.sort((a, b) => a.pricePerDay - b.pricePerDay);
                break;

            case 'price_desc':
                out.sort((a, b) => b.pricePerDay - a.pricePerDay);
                break;

            case 'newest':
                out.sort((a: any, b: any) =>
                    (b.createdAt || 0) - (a.createdAt || 0)
                );
                break;

            default: // popular — sync logic với Homepage
                out.sort((a, b) => {
                    // 1) tính điểm phổ biến
                    const pa = this.getPopularity(a);
                    const pb = this.getPopularity(b);

                    // 2) xe còn xuất trước xe hết
                    const avail = Number(b.availabilityStatus) - Number(a.availabilityStatus);

                    return (
                        pb - pa ||        // phổ biến
                        avail ||          // còn xe ưu tiên
                        b.discount - a.discount
                    );
                });
        }

        return out;
    });

    total = computed(() => this.filtered().length);
    totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

    topRentList = computed(() => {
        const start = (this.page() - 1) * this.pageSize;
        return this.filtered().slice(start, start + this.pageSize);
    });

    // ========================================================================
    // EVENTS
    // ========================================================================

    toggleType(
        label: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn',
        checked: boolean
    ) {
        const s = new Set(this.selectedTypes());
        checked ? s.add(label) : s.delete(label);
        this.selectedTypes.set(s);
        this.page.set(1);
    }

    isTypeSelected(label: string): boolean {
        return this.selectedTypes().has(label);
    }

    toggleBrand(name: string, checked: boolean) {
        const s = new Set(this.selectedBrands());
        checked ? s.add(name) : s.delete(name);
        this.selectedBrands.set(s);
        this.page.set(1);
    }

    onMinPriceChange(val: string | number) {
        const n = typeof val === 'number' ? val : parseInt(val as string, 10) || 0;
        const clamped = Math.max(0, Math.min(n, this.maxPrice()));
        this.minPrice.set(clamped);
        this.page.set(1);
    }

    onMaxPriceChange(val: string | number) {
        const n = typeof val === 'number' ? val : parseInt(val as string, 10) || 0;
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

    // ========================================================================
    // BUILD PARAMS
    // ========================================================================

    private buildTypeSlug(p: ProductVM): string | undefined {
        const label = this.productService.getVehicleTypeLabel(p.vehicleType ?? '');
        return TYPE_SLUG_MAP[label];
    }

    buildQueryParamsFor(p: ProductVM) {
        const base = this.buildDateParams();
        const type = this.buildTypeSlug(p);
        return type ? { ...base, type } : base;
    }

    goToDetail(p: ProductVM) {
        const params = this.buildQueryParamsFor(p);
        this.router.navigate(['/rent', p.id], { queryParams: params });
    }

    // ========================================================================
    // RENT MODE + DATE HANDLING
    // ========================================================================

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
    cyclePriceSort() {
    const current = this.sortKey();

    if (current === 'price_asc') {
        // Đang là Thấp -> Cao, chuyển sang Cao -> Thấp
        this.setSort('price_desc');
    } else if (current === 'price_desc') {
        // Đang là Cao -> Thấp, quay về Mặc định (Phổ biến)
        this.setSort('popular');
    } else {
        // Đang là Mặc định (hoặc Mới nhất), chuyển sang Thấp -> Cao
        this.setSort('price_asc');
    }
    }


    // ========================================================================
    // HELPERS
    // ========================================================================

    /** format tiền */
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

    /** thanh giá sáng theo mức giá */
    priceRangeBackground(): string {
        const max = 500_000;
        const val = Math.min(Math.max(this.maxPrice(), 0), max);
        const percent = (val / max) * 100;

        return `linear-gradient(to right,
                #72d4a5 0%,
                #72d4a5 ${percent}%,
                #e5e7eb ${percent}%,
                #e5e7eb 100%)`;
    }

    private getPopularity(p: ProductVM): number {
        const anyP: any = p;
        return (
            anyP.totalRentals ??
            anyP.rentalCount ??
            anyP.popularityScore ??
            0
        );
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
            if (d.getDate() < startDay) d.setDate(0);
            return this.toInputDate(d);
        }

        // default: day
        d.setDate(d.getDate() + 1);
        return this.toInputDate(d);
    }

    buildDateParams() {
        const start = this.startDate() || this.todayStr;
        const end = this.endDate() || this.calcMinEndDate(this.rentMode(), start);
        return { start, end };
    }
}

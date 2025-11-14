import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
    ProductLoadingService,
    ProductVM,
} from '../../services/product-loading.services';

type SortKey = 'popular' | 'newest' | 'price_asc' | 'price_desc';
type RentMode = 'day' | 'week' | 'month';

const TYPE_MAP: Record<string, string[]> = {
    'Xe máy điện': ['Motorbike', 'Scooter'],
    'Xe đạp điện': ['E-Bike', 'Bicycle', 'Electric Bicycle'],
    'Xe đạp điện gấp gọn': [], // nhận diện qua tags 'compact' hoặc 'foldable'
};

@Component({
    selector: 'app-rent',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './rent.html',
    styleUrls: ['./rent.css'],
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
    q = signal<string>(''); // keyword
    selectedTypes = signal<Set<string>>(new Set()); // "Xe máy điện", ...
    selectedBrands = signal<Set<string>>(new Set()); // Vinfast, Yadea, ...
    minPrice = signal<number>(0);
    maxPrice = signal<number>(500_000);
    sortKey = signal<SortKey>('popular'); // mặc định: phổ biến
    pageSize = 12; // 3 hàng x 4 xe / trang
    page = signal(1);

    /** Thuê theo ngày / tuần / tháng + ngày bắt đầu / kết thúc */
    rentMode = signal<RentMode>('day');
    startDate = signal<string>('');
    endDate = signal<string>('');
    todayStr = this.toInputDate(new Date());

    /** UI state nhỏ */
    showPriceMenu = signal(false);
    showRentModeMenu = signal(false);
    cityNotice = signal<string>('');

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

    constructor() {
        // nạp data (SSR-friendly, cache từ TransferState)
        this.svc.getAll().subscribe((list) => this.all.set(list || []));

        // set mặc định ngày thuê / trả
        const start = this.todayStr;
        this.startDate.set(start);
        this.endDate.set(this.calcMinEndDate(this.rentMode(), start));

        // đọc query param ?q=... để sync với header search
        this.route.queryParamMap.subscribe((p) => {
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
        const min = this.minPrice();
        const max = this.maxPrice();
        let out = list.slice();

        // Keyword search (tên / loại / tags / thương hiệu)
        if (q) {
            out = out.filter((p) =>
                [p.vehicleName, p.vehicleType, p.brandName, ...(p.tags || [])]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q)),
            );
        }

        // Lọc theo loại xe
        if (types.size) {
            out = out.filter((p) => {
                const foldTag = (p.tags || []).some((t) =>
                    ['compact', 'foldable'].includes(String(t).toLowerCase()),
                );
                for (const label of types) {
                    if (label === 'Xe đạp điện gấp gọn' && foldTag) return true;
                    const accept = TYPE_MAP[label] || [];
                    if (accept.includes(p.vehicleType)) return true;
                }
                return false;
            });
        }

        // Lọc theo thương hiệu
        if (brands.size) {
            out = out.filter((p) => p.brandName && brands.has(p.brandName));
        }

        // Giới hạn giá
        out = out.filter(p => p.pricePerDay >= min && p.pricePerDay <= max);

        // Sort
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
                        (b.createdAt || 0) - (a.createdAt || 0) || b.discount - a.discount,
                );
                break;
            default: {
                // popular: dựa trên số lượt thuê/bán
                out.sort((a, b) => {
                    const pa = this.getPopularity(a);
                    const pb = this.getPopularity(b);
                    return (
                        pb - pa ||
                        b.discount - a.discount ||
                        Number(b.availabilityStatus) - Number(a.availabilityStatus)
                    );
                });
            }
        }

        return out;
    });

    /** Phân trang */
    total = computed(() => this.filtered().length);
    totalPages = computed(() =>
        Math.max(1, Math.ceil(this.total() / this.pageSize)),
    );

    topRentList = computed(() => {
        const start = (this.page() - 1) * this.pageSize;
        return this.filtered().slice(start, start + this.pageSize);
    });

    /* ---------- EVENT HANDLERS ---------- */

    toggleType(
        label: 'Xe máy điện' | 'Xe đạp điện' | 'Xe đạp điện gấp gọn',
        checked: boolean,
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
            queryParamsHandling: 'merge',
        });
    }

    /** Điều hướng sang trang chi tiết (không dùng queryParams ở HTML thì có thể dùng hàm này) */
    goToDetail(p: ProductVM) {
        const start = this.startDate() || this.todayStr;
        const end = this.endDate() || this.calcMinEndDate(this.rentMode(), start);

        this.router.navigate(['/rent', p.id], {
            queryParams: { start, end },
        });
    }

    /** Thuê theo ngày / tuần / tháng */

    toggleRentModeMenu() {
        this.showRentModeMenu.update((v) => !v);
    }

    setRentMode(mode: RentMode) {
        this.rentMode.set(mode);

        const start = this.startDate() || this.todayStr;
        const normalizedStart = this.toInputDate(
            this.parseDate(start) || new Date(this.todayStr),
        );
        this.startDate.set(normalizedStart);
        this.endDate.set(this.calcMinEndDate(mode, normalizedStart));

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

        this.endDate.set(this.toInputDate(end));
    }

    onCityChange(_: string) {
        if (typeof window !== 'undefined') {
            alert('Tính năng lọc theo khu vực đang được phát triển.');
        }
    }

    /** Dropdown Giá */
    togglePriceMenu() {
        this.showPriceMenu.update((v) => !v);
    }

    closePriceMenu() {
        this.showPriceMenu.set(false);
    }

    /** Định dạng tiền Việt Nam */
    formatVND(n: number) {
        try {
            return n.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
            });
        } catch {
            return `${n}đ`;
        }
    }

    /* ---------- HELPERS ---------- */

    private getPopularity(p: ProductVM): number {
        const anyP: any = p;
        return anyP.totalRentals ?? anyP.rentalCount ?? anyP.popularityScore ?? 0;
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

            // nếu bị tụt ngày (31 -> 30/29/28) thì set cuối tháng
            if (d.getDate() < startDay) {
                d.setDate(0); // ngày 0 = ngày cuối tháng trước
            }
            return this.toInputDate(d);
        }

        // day: ít nhất +1 ngày
        d.setDate(d.getDate() + 1);
        return this.toInputDate(d);
    }

    /** Query params ngày thuê / trả cho routerLink */
    buildDateParams() {
        const start = this.startDate() || this.todayStr;
        const end = this.endDate() || this.calcMinEndDate(this.rentMode(), start);
        return { start, end };
    }
}
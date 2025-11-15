import { Injectable, signal, computed, effect } from '@angular/core';

export interface RentalDateRange {
    start: string | null; // 'YYYY-MM-DD'
    end: string | null;
}

const STORAGE_KEY = 'eco_rental_dates';

@Injectable({ providedIn: 'root' })
export class RentalDatesService {
    private readonly _range = signal<RentalDateRange>({ start: null, end: null });

    /** cho component đọc */
    readonly range = computed(() => this._range());

    constructor() {
        // SSR-safe: chỉ đọc localStorage khi đang ở browser
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed.start === 'string' || parsed.start === null) {
                        this._range.set(parsed);
                    }
                } catch {
                    // kệ, không cần quăng lỗi
                }
            }

            effect(() => {
                const current = this._range();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            });
        }
    }

    setRange(start: string | null, end: string | null) {
        this._range.set({ start, end });
    }

    setFromCartItem(item: { rentStart?: string; rentEnd?: string }) {
        if (!item.rentStart || !item.rentEnd) return;
        this._range.set({ start: item.rentStart, end: item.rentEnd });
    }
}

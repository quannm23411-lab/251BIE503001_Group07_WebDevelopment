// src/app/services/cart.services.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export interface CartItem {
    id: string;               // productId_start_end
    productId: string;
    name: string;
    imageUrl: string;
    brandName?: string;
    vehicleType?: string;

    rentStart?: string;
    rentEnd?: string;
    totalDays: number;

    pricePerDay: number;
    finalPricePerDay: number;

    quantity: number;
    subtotal: number;         // finalPricePerDay * totalDays * quantity

    // map trực tiếp từ products.json: true = còn xe, false = hết hàng
    availabilityStatus?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly STORAGE_KEY = 'ecomove_cart';
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private readonly _items = signal<CartItem[]>([]);

    readonly items = this._items.asReadonly();

    readonly totalQuantity = computed(() =>
        this._items().reduce((sum, item) => sum + item.quantity, 0)
    );

    readonly totalAmount = computed(() =>
        this._items().reduce((sum, item) => sum + item.subtotal, 0)
    );

    constructor() {
        if (this.isBrowser) {
            const saved = this.loadFromStorage();
            if (saved) {
                this._items.set(saved);
            }

            effect(() => {
                const current = this._items();
                try {
                    window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
                } catch {
                    // kệ, không lưu được thì thôi
                }
            });
        }
    }

    // hàm mới, thay toàn bộ giỏ hàng
    setItems(items: CartItem[]): void {
        this._items.set(items);
    }

    private loadFromStorage(): CartItem[] | null {
        if (!this.isBrowser) return null;
        try {
            const raw = window.localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;
            return parsed;
        } catch {
            return null;
        }
    }

    updateQuantity(id: string, quantity: number) {
        if (quantity <= 0) {
            this.removeItem(id);
            return;
        }
        this._items.update(items =>
            items.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity,
                        subtotal: item.finalPricePerDay * item.totalDays * quantity
                    }
                    : item
            )
        );
    }

    removeItem(id: string) {
        this._items.update(items => items.filter(item => item.id !== id));
    }

    clear() {
        this._items.set([]);
    }

    // Hàm này gọi từ Product Detail
    addOrUpdateFromProduct(payload: {
        productId: string;
        name: string;
        imageUrl: string;
        brandName?: string;
        vehicleType?: string;
        pricePerDay: number;
        finalPricePerDay: number;
        rentStart?: string | null;
        rentEnd?: string | null;
        quantity?: number;
        availabilityStatus?: boolean;  // true false giống products.json
    }) {
        const rentStart = payload.rentStart || undefined;
        const rentEnd = payload.rentEnd || undefined;
        const quantity = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;

        const totalDays = this.calculateDays(rentStart, rentEnd);
        const id = `${payload.productId}_${rentStart || 'none'}_${rentEnd || 'none'}`;
        const subtotal = payload.finalPricePerDay * totalDays * quantity;

        this._items.update(items => {
            const existing = items.find(i => i.id === id);
            if (!existing) {
                return [
                    ...items,
                    {
                        id,
                        productId: payload.productId,
                        name: payload.name,
                        imageUrl: payload.imageUrl,
                        brandName: payload.brandName,
                        vehicleType: payload.vehicleType,
                        rentStart,
                        rentEnd,
                        totalDays,
                        pricePerDay: payload.pricePerDay,
                        finalPricePerDay: payload.finalPricePerDay,
                        quantity,
                        subtotal,
                        availabilityStatus: payload.availabilityStatus ?? true
                    }
                ];
            }

            const newQuantity = existing.quantity + quantity;
            return items.map(i =>
                i.id === id
                    ? {
                        ...i,
                        quantity: newQuantity,
                        subtotal: existing.finalPricePerDay * existing.totalDays * newQuantity
                    }
                    : i
            );
        });
    }

    /**
     * Dùng khi user chỉnh lại ngày thuê trong giỏ hàng.
     * - Cập nhật rentStart / rentEnd / totalDays / subtotal
     * - Cập nhật lại id = productId_start_end
     * - Nếu trùng với 1 item khác cùng product + cùng ngày thì gộp quantity
     */
    updateItemDates(id: string, rentStart: string, rentEnd: string): CartItem | null {
        let updated: CartItem | null = null;

        this._items.update(items => {
            const index = items.findIndex(i => i.id === id);
            if (index === -1) return items;

            const item = items[index];

            const totalDays = this.calculateDays(rentStart, rentEnd);
            const newId = `${item.productId}_${rentStart || 'none'}_${rentEnd || 'none'}`;
            const subtotal = item.finalPricePerDay * totalDays * item.quantity;

            const updatedItem: CartItem = {
                ...item,
                id: newId,
                rentStart,
                rentEnd,
                totalDays,
                subtotal
            };

            // nếu có item khác trùng newId thì gộp lại
            const mergeIndex = items.findIndex((i, idx) => idx !== index && i.id === newId);

            if (mergeIndex !== -1) {
                const target = items[mergeIndex];
                const mergedQuantity = target.quantity + updatedItem.quantity;
                const mergedSubtotal = updatedItem.finalPricePerDay * updatedItem.totalDays * mergedQuantity;

                const next = items.slice();
                next[mergeIndex] = {
                    ...target,
                    quantity: mergedQuantity,
                    subtotal: mergedSubtotal
                };
                // xóa item cũ
                next.splice(index, 1);
                updated = next[mergeIndex];
                return next;
            } else {
                const next = items.slice();
                next[index] = updatedItem;
                updated = updatedItem;
                return next;
            }
        });

        return updated;
    }

    private calculateDays(start?: string, end?: string): number {
        if (!start || !end) return 1;
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 1;
    }
}

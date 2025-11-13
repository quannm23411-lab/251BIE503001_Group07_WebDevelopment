import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.html',
    styleUrls: ['./cart.css'],
})
export class CartPage {
    private cart = inject(CartService);
    private router = inject(Router);

    // Signals từ CartService
    readonly items = this.cart.items;
    readonly totalQuantity = this.cart.totalQuantity;
    readonly totalAmount = this.cart.totalAmount;

    // =========================
    // SELECTION STATE
    // =========================

    /** Lưu danh sách productId đang được tick */
    readonly selectedIds = signal<Set<string>>(new Set());

    /** Flag: lần đầu vào từ product-detail, auto chọn item nhưng KHÔNG tick "Tất cả" */
    private autoSelectedFromState = false;

    /** Key dùng cho selection: ưu tiên productId, fallback về id */
    private getKey(item: CartItem): string {
        return String((item as any).productId ?? item.id);
    }

    constructor() {
        const nav = this.router.getCurrentNavigation();
        const state = (nav?.extras.state || {}) as { autoSelectId?: string };

        if (state.autoSelectId) {
            this.selectedIds.set(new Set([String(state.autoSelectId)]));
            this.autoSelectedFromState = true;
        }
    }

    trackById(index: number, item: CartItem) {
        return item.id;
    }

    // ========== DATE LABEL ==========
    getRentalDateLabel(item: CartItem): string {
        if (!item.rentStart || !item.rentEnd) return '';

        const start = new Date(item.rentStart);
        const end = new Date(item.rentEnd);

        const startStr = start.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const endStr = end.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        return `Ngày nhận: ${startStr} • Ngày trả: ${endStr}`;
    }

    // ========== CART ACTIONS ==========
    increase(item: CartItem) {
        this.cart.updateQuantity(item.id, item.quantity + 1);
    }

    decrease(item: CartItem) {
        this.cart.updateQuantity(item.id, item.quantity - 1);
    }

    remove(item: CartItem) {
        this.cart.removeItem(item.id);

        const next = new Set(this.selectedIds());
        next.delete(this.getKey(item));
        this.selectedIds.set(next);
    }

    clear() {
        this.cart.clear();
        this.selectedIds.set(new Set());
    }

    // ========== SELECTION HELPERS ==========

    isItemSelected(item: CartItem): boolean {
        return this.selectedIds().has(this.getKey(item));
    }

    toggleItem(item: CartItem, checked: boolean) {
        this.autoSelectedFromState = false; // từ đây trở đi user tự control

        const next = new Set(this.selectedIds());
        const key = this.getKey(item);

        if (checked) {
            next.add(key);
        } else {
            next.delete(key);
        }

        this.selectedIds.set(next);
    }

    isAllSelected(): boolean {
        if (this.autoSelectedFromState) return false; // không auto tick "Tất cả"

        const list = this.items();
        const selected = this.selectedIds();
        return list.length > 0 && selected.size === list.length;
    }

    isIndeterminate(): boolean {
        if (this.autoSelectedFromState) return false; // cũng không cho trạng thái lửng lơ

        const list = this.items();
        const selected = this.selectedIds();
        return selected.size > 0 && selected.size < list.length;
    }

    toggleSelectAll(checked: boolean) {
        this.autoSelectedFromState = false; // từ lúc user click thì bỏ chế độ auto

        if (checked) {
            const all = new Set<string>(
                this.items().map(it => this.getKey(it))
            );
            this.selectedIds.set(all);
        } else {
            this.selectedIds.set(new Set());
        }
    }

    // ========== TOTALS THEO ITEM ĐƯỢC CHỌN ==========
    readonly selectedTotalAmount = computed(() => {
        const ids = this.selectedIds();
        const list = this.items();
        let sum = 0;

        for (const it of list) {
            if (ids.has(this.getKey(it))) {
                sum += it.subtotal || 0;
            }
        }
        return sum;
    });

    readonly selectedTotalQuantity = computed(() => {
        const ids = this.selectedIds();
        const list = this.items();
        let qty = 0;

        for (const it of list) {
            if (ids.has(this.getKey(it))) {
                qty += it.quantity || 0;
            }
        }
        return qty;
    });
}

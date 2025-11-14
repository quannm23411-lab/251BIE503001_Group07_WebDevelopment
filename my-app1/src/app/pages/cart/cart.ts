import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';
import { Auth } from '../../services/auth/auth'; // ✅ chỉ import Auth, KHÔNG inject AuthUser


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
    private auth = inject(Auth); // 👈 THÊM DÒNG NÀY

    // Signals từ CartService
    readonly items = this.cart.items;
    readonly totalQuantity = this.cart.totalQuantity;
    readonly totalAmount = this.cart.totalAmount;

    // =========================
    // SELECTION STATE
    // =========================

    /** Lưu danh sách id của từng dòng trong giỏ (id = productId_start_end) */
    readonly selectedIds = signal<Set<string>>(new Set());

    /** Trạng thái riêng cho checkbox "Tất cả" (không auto sync theo item) */
    readonly selectAllChecked = signal(false);

    /** Key dùng cho selection: luôn theo id của dòng cart */
    private getKey(item: CartItem): string {
        return item.id;
    }

    getSelectedIdsArray() {
        return Array.from(this.selectedIds());
    }

    constructor() {
        const nav = this.router.getCurrentNavigation();
        const state = (nav?.extras.state || {}) as { autoSelectId?: string };

        if (state.autoSelectId) {
            this.selectedIds.set(new Set([String(state.autoSelectId)]));
        }
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
    trackById(index: number, item: CartItem) {
        return item.id;
    }

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
        this.selectAllChecked.set(false);
    }

    clear() {
        this.cart.clear();
        this.selectedIds.set(new Set());
        this.selectAllChecked.set(false);
    }

    onCheckoutClick() {
        const selectedIds = this.getSelectedIdsArray
            ? this.getSelectedIdsArray()
            : Array.from(this.selectedIds?.() ?? []);

        if (!selectedIds.length) {
            return;
        }

        if (this.auth.isLoggedIn()) {
            this.router.navigate(['/checkout'], {
                state: { selectedIds }
            });
        } else {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/checkout' },
                state: { selectedIds }
            });
        }
    }

    // ========== SELECTION HELPERS ==========

    isItemSelected(item: CartItem): boolean {
        return this.selectedIds().has(this.getKey(item));
    }

    toggleItem(item: CartItem, checked: boolean) {
        const next = new Set(this.selectedIds());
        const key = this.getKey(item);

        if (checked) {
            next.add(key);
        } else {
            next.delete(key);
        }

        this.selectedIds.set(next);
        // User đã thao tác từng item thì "Tất cả" phải tự tắt
        this.selectAllChecked.set(false);
    }

    toggleSelectAll(checked: boolean) {
        this.selectAllChecked.set(checked);

        if (checked) {
            const all = new Set<string>(this.items().map(it => this.getKey(it)));
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

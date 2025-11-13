import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

    // Signals từ CartService
    readonly items = this.cart.items;
    readonly totalQuantity = this.cart.totalQuantity;
    readonly totalAmount = this.cart.totalAmount;

    trackById(index: number, item: CartItem) {
        return item.id;
    }

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

    increase(item: CartItem) {
        this.cart.updateQuantity(item.id, item.quantity + 1);
    }

    decrease(item: CartItem) {
        this.cart.updateQuantity(item.id, item.quantity - 1);
    }

    remove(item: CartItem) {
        this.cart.removeItem(item.id);
    }

    clear() {
        this.cart.clear();
    }
}

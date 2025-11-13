// src/app/pages/cart/cart.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cart.html',
    styleUrls: ['./cart.css'],
})
export class CartPage {
    private readonly cart = inject(CartService);

    readonly items = this.cart.items;
    readonly totalQuantity = this.cart.totalQuantity;
    readonly totalAmount = this.cart.totalAmount;

    trackById(index: number, item: CartItem) {
        return item.id;
    }

    decrease(item: CartItem) {
        const newQty = item.quantity - 1;
        this.cart.updateQuantity(item.id, newQty);
    }

    increase(item: CartItem) {
        const newQty = item.quantity + 1;
        this.cart.updateQuantity(item.id, newQty);
    }

    remove(item: CartItem) {
        this.cart.removeItem(item.id);
    }

    clear() {
        this.cart.clear();
    }

    getRentalDateLabel(item: CartItem): string {
        if (item.rentStart && item.rentEnd) {
            return `${item.rentStart} → ${item.rentEnd} · ${item.totalDays} ngày`;
        }
        return `${item.totalDays} ngày · chưa chọn ngày nhận/trả`;
    }
}

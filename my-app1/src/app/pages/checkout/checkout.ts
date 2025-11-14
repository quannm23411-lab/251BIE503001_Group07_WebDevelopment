import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';

interface CheckoutForm {
    fullName: string;
    phone: string;
    email: string;
    nationalId: string;
    pickupLocation: string;
    pickupTime: string;
    returnTime: string;
    paymentMethod: string;
    note: string;
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.css'],
})
export class Checkout {
    private cart = inject(CartService);
    private router = inject(Router);

    // form model (KHÔNG dùng signal để tránh lỗi [(ngModel)])
    form: CheckoutForm = {
        fullName: '',
        phone: '',
        email: '',
        nationalId: '',
        pickupLocation: '',
        pickupTime: '',
        returnTime: '',
        paymentMethod: 'cod',
        note: '',
    };

    // state hiển thị
    isSubmitting = signal(false);
    isSuccess = signal(false);
    orderCode = signal<string | null>(null);
    createdAt = signal<Date | null>(null);

    // toàn bộ item trong giỏ (signal từ CartService)
    readonly cartItems = this.cart.items;

    // danh sách item thực sự đem đi thanh toán (subset theo tick)
    readonly selectedItems = signal<CartItem[]>([]);

    // tổng SL / tổng tiền theo selectedItems
    readonly selectedTotalQuantity = computed(() =>
        this.selectedItems().reduce((sum, item) => sum + (item.quantity || 0), 0)
    );

    readonly selectedTotalAmount = computed(() =>
        this.selectedItems().reduce((sum, item) => sum + (item.subtotal || 0), 0)
    );

    // helper format tiền
    vnd(n: number | null | undefined): string {
        if (n == null) return '0₫';
        return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    get hasItems(): boolean {
        return this.selectedItems().length > 0;
    }

    constructor() {
        // đọc selectedIds được truyền từ trang Cart
        const nav = this.router.getCurrentNavigation();
        const state = (nav?.extras.state || {}) as { selectedIds?: string[] };
        const ids = state?.selectedIds;

        const all = this.cartItems();

        if (ids && ids.length > 0) {
            // lọc lại đúng những item được tick trong cart
            const subset = all.filter(it => ids.includes(it.id));
            this.selectedItems.set(subset);
        } else {
            // TH user gõ thẳng /checkout, hoặc reload F5:
            // nếu trong giỏ còn hàng → cho thanh toán hết,
            // nếu giỏ trống → đá về /cart
            if (all.length > 0) {
                this.selectedItems.set(all);
            } else {
                this.router.navigate(['/cart']);
            }
        }
    }

    onSubmit(formRef: NgForm) {
        if (!this.hasItems) {
            return;
        }

        if (formRef.invalid) {
            formRef.control.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        // giả lập tạo đơn
        const code = 'ECM-' + Date.now().toString().slice(-6);
        this.orderCode.set(code);
        this.createdAt.set(new Date());

        // clear GIỎ sau khi đặt thành công
        this.cart.clear();
        this.selectedItems.set([]);

        this.isSubmitting.set(false);
        this.isSuccess.set(true);

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    backToRent() {
        this.router.navigate(['/rent']);
    }
}

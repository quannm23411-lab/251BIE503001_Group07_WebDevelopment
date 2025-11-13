import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.services';

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

    // shortcuts lấy dữ liệu giỏ hàng
    cartItems = this.cart.items;          // signal<CartItem[]>
    totalQuantity = this.cart.totalQuantity; // computed
    totalAmount = this.cart.totalAmount;     // computed

    // helper format tiền
    vnd(n: number | null | undefined): string {
        if (n == null) return '0₫';
        return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    get hasItems(): boolean {
        return (this.cartItems() ?? []).length > 0;
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

        // clear giỏ sau khi đặt thành công
        this.cart.clear();

        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    backToRent() {
        this.router.navigate(['/rent']);
    }
}

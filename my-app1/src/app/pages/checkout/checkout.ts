import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';
import { LoginService } from '../../services/login/login.service';

interface CheckoutForm {
    fullName: string;
    phone: string;
    email: string;
    nationalId: string;        // dùng cho SỐ BẰNG LÁI (khách chính)
    pickupLocation: string;
    pickupTime: string;
    returnTime: string;
    paymentMethod: string;
    note: string;
}

interface ReceiverForm {
    fullName: string;
    phone: string;
    nationalId: string;        // CCCD / bằng lái người nhận
    noteForDriver: string;
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
    private loginService = inject(LoginService);

    // form người đặt (chỉ đọc, trừ ghi chú)
    form: CheckoutForm = {
        fullName: '',
        phone: '',
        email: '',
        nationalId: '',
        pickupLocation: '',
        pickupTime: '',
        returnTime: '',
        paymentMethod: 'cash',
        note: '',
    };

    // form người nhận
    receiver: ReceiverForm = {
        fullName: '',
        phone: '',
        nationalId: '',
        noteForDriver: '',
    };

    // toggle: người nhận giống người đặt?
    receiverSameAsCustomer = true;

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

    // số tiền giảm giá (sau này xử lý voucher thì set lại signal này)
    discountAmount = signal(0);

    // số tiền thực tế phải thanh toán = tổng - giảm giá (không âm)
    readonly payableAmount = computed(() => {
        const total = this.selectedTotalAmount();
        const discount = this.discountAmount();
        const result = total - discount;
        return result > 0 ? result : 0;
    });

    // helper format tiền
    vnd(n: number | null | undefined): string {
        if (n == null) return '0₫';
        return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    get hasItems(): boolean {
        return this.selectedItems().length > 0;
    }

    constructor() {
        // đọc selectedIds được truyền từ Cart
        const nav = this.router.getCurrentNavigation();
        const state = (nav?.extras.state || {}) as { selectedIds?: string[] };
        const ids = state?.selectedIds;

        const all = this.cartItems();

        if (ids && ids.length > 0) {
            const subset = all.filter(it => ids.includes(it.id));
            this.selectedItems.set(subset);
        } else {
            if (all.length > 0) {
                this.selectedItems.set(all);
            } else {
                this.router.navigate(['/cart']);
            }
        }

        // TỰ FILL THÔNG TIN KHÁCH HÀNG TỪ eco_profile QUA LoginService
        const profile = this.loginService.getProfile();
        if (profile) {
            this.form.fullName = profile.fullname || '';
            this.form.email = profile.email || '';
            // phone, nationalId, address... sẽ lấy từ customers.json sau nếu cần
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

        const code = 'ECM-' + Date.now().toString().slice(-6);
        this.orderCode.set(code);
        this.createdAt.set(new Date());

        // ở đây nếu cần gửi backend thì gom data:
        // const customerInfo = { ...this.form };
        // const receiverInfo = this.receiverSameAsCustomer
        //   ? customerInfo
        //   : this.receiver;

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

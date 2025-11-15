import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.services';
import { LoginService } from '../../services/login/login.service';
import { RentalDatesService } from '../../services/rental-dates.services';
import promotionsData from '../../../assets/data/promotions.json';

interface Promotion {
    id: string;
    maGiamGia: string;
    tenKhuyenMai: string;
    loaiGiamGia: 'percent' | 'fixed';
    giaTri: number;
    donHangToiThieu: number;
    soLuongToiDa: number;
    soLuongDaDung: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThai: string;
}

interface CheckoutForm {
    fullName: string;
    phone: string;
    email: string;
    soBangLai: string;
    pickupLocation: string;
    pickupTime: string;
    returnTime: string;
    paymentMethod: string;
    note: string;
}

interface ReceiverForm {
    fullName: string;
    phone: string;
    soBangLai: string;
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
    private rentalDates = inject(RentalDatesService);

    // trạng thái
    isSubmitting = signal(false);
    isSuccess = signal(false);
    isWaitingTransfer = signal(false); // đang hiển thị QR
    transferDone = signal(false);
    orderCode = signal<string | null>(null);
    createdAt = signal<Date | null>(null);

    // form người đặt
    form: CheckoutForm = {
        fullName: '',
        phone: '',
        email: '',
        soBangLai: '',
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
        soBangLai: '',
        noteForDriver: '',
    };

    receiverSameAsCustomer = true;

    // giỏ hàng
    readonly cartItems = this.cart.items;
    readonly selectedItems = signal<CartItem[]>([]);

    readonly selectedTotalQuantity = computed(() =>
        this.selectedItems().reduce((s, i) => s + (i.quantity || 0), 0)
    );

    readonly selectedTotalAmount = computed(() =>
        this.selectedItems().reduce((s, i) => s + (i.subtotal || 0), 0)
    );

    // voucher
    voucherCode = '';
    appliedVoucher = signal<Promotion | null>(null);
    voucherError = signal<string | null>(null);

    discountAmount = signal(0);

    readonly payableAmount = computed(() => {
        const total = this.selectedTotalAmount();
        const dc = this.discountAmount();
        return total - dc > 0 ? total - dc : 0;
    });

    // điều khoản
    acceptTerms = false;
    termsError = signal(false);

    // icon phương thức thanh toán
    paymentIcons: Record<string, string> = {
        bank: 'assets/images/payment-icons/bank.png',
        momo: 'assets/images/payment-icons/momo.png',
        cash: 'assets/images/payment-icons/cash.png',
    };

    getPaymentIcon(method: string): string {
        return this.paymentIcons[method] ?? this.paymentIcons['cash'];
    }

    // ảnh QR cho momo / bank
    qrImages: Record<string, string> = {
        bank: 'assets/bank-qr.png',
        momo: 'assets/momo-qr.png',
        cash: 'assets/cash-qr.png', // phòng khi sau này dùng, giờ không cũng được
    };

    getQrImage(): string {
        const m = this.form.paymentMethod;
        return this.qrImages[m] ?? this.qrImages['bank'];
    }

    // helper tiền
    vnd(n: number | null | undefined): string {
        if (n == null) return '0₫';
        return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    get hasItems() {
        return this.selectedItems().length > 0;
    }

    constructor() {
        // đọc selectedIds từ Cart
        const nav = this.router.getCurrentNavigation();
        const state = (nav?.extras.state || {}) as { selectedIds?: string[] };

        const ids = state?.selectedIds;
        const all = this.cartItems();

        if (ids?.length) {
            this.selectedItems.set(all.filter((i) => ids.includes(i.id)));
        } else {
            if (all.length === 0) this.router.navigate(['/cart']);
            this.selectedItems.set(all);
        }

        this.syncGlobalDatesFromSelected();

        // auto-fill profile
        const profile = this.loginService.getProfile();
        if (profile) {
            this.form.fullName = profile.fullname || '';
            this.form.email = profile.email || '';
            this.form.phone = profile.phone || '';
            this.form.soBangLai = profile.driverLicense || '';

            if (!this.form.note && profile.address) {
                this.form.note = `Địa chỉ khách: ${profile.address}`;
            }
        }
    }

    toggleReceiverMode() {
        this.receiverSameAsCustomer = !this.receiverSameAsCustomer;
    }

    private syncGlobalDatesFromSelected() {
        const items = this.selectedItems();
        if (!items.length) return;

        let minStart: string | null = null;
        let maxEnd: string | null = null;

        for (const it of items) {
            if (it.rentStart) {
                if (!minStart || new Date(it.rentStart) < new Date(minStart)) {
                    minStart = it.rentStart;
                }
            }
            if (it.rentEnd) {
                if (!maxEnd || new Date(it.rentEnd) > new Date(maxEnd)) {
                    maxEnd = it.rentEnd;
                }
            }
        }

        if (minStart && maxEnd) this.rentalDates.setRange(minStart, maxEnd);
    }

    // xử lý voucher
    applyVoucher() {
        const code = this.voucherCode.trim().toUpperCase();
        if (!code) {
            this.voucherError.set('Vui lòng nhập mã giảm giá.');
            this.appliedVoucher.set(null);
            this.discountAmount.set(0);
            return;
        }

        const promo = (promotionsData as Promotion[]).find(
            (p) => p.maGiamGia.toUpperCase() === code
        );

        if (!promo) {
            this.voucherError.set('Mã giảm giá không tồn tại.');
            this.appliedVoucher.set(null);
            this.discountAmount.set(0);
            return;
        }

        const now = new Date();
        const start = new Date(promo.ngayBatDau);
        const end = new Date(promo.ngayKetThuc);

        if (promo.trangThai !== 'active' || now < start || now > end) {
            this.voucherError.set('Mã giảm giá đã hết hạn hoặc chưa bắt đầu.');
            this.appliedVoucher.set(null);
            this.discountAmount.set(0);
            return;
        }

        if (promo.soLuongDaDung >= promo.soLuongToiDa) {
            this.voucherError.set('Mã giảm giá đã được sử dụng hết.');
            this.appliedVoucher.set(null);
            this.discountAmount.set(0);
            return;
        }

        const total = this.selectedTotalAmount();
        if (total < promo.donHangToiThieu) {
            this.voucherError.set(
                `Đơn tối thiểu phải từ ${promo.donHangToiThieu.toLocaleString()}₫`
            );
            this.appliedVoucher.set(null);
            this.discountAmount.set(0);
            return;
        }

        let discount = 0;
        if (promo.loaiGiamGia === 'percent') {
            discount = Math.floor((total * promo.giaTri) / 100);
        } else {
            discount = promo.giaTri;
        }

        this.voucherError.set(null);
        this.appliedVoucher.set(promo);
        this.discountAmount.set(discount);
    }

    onSubmit(formRef: NgForm) {
        this.termsError.set(false);

        if (!this.acceptTerms) {
            this.termsError.set(true);
            return;
        }

        if (!this.receiverSameAsCustomer) {
            const { fullName, phone, soBangLai } = this.receiver;
            if (!fullName?.trim() || !phone?.trim() || !soBangLai?.trim()) {
                formRef.control.markAllAsTouched();
                return;
            }
        }

        if (formRef.invalid) {
            formRef.control.markAllAsTouched();
            return;
        }

        // BANK / MOMO → qua bước QR
        if (this.form.paymentMethod === 'bank' || this.form.paymentMethod === 'momo') {
            this.isWaitingTransfer.set(true);
            return;
        }

        // Tiền mặt: finalize luôn
        this.finalizeOrder();
    }

    // tạo đơn & clear cart
    finalizeOrder() {
        this.isSubmitting.set(true);

        const code = 'ECM-' + Date.now().toString().slice(-6);
        this.orderCode.set(code);
        this.createdAt.set(new Date());

        this.cart.clear();
        this.selectedItems.set([]);

        this.isSubmitting.set(false);
        this.isSuccess.set(true);

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // dùng trong HTML: (click)="confirmTransfer()"
    confirmTransfer() {
        this.isWaitingTransfer.set(false);
        this.transferDone.set(true);
        this.finalizeOrder();
    }

    cancelTransfer() {
        this.isWaitingTransfer.set(false);
    }

    backToRent() {
        const r = this.rentalDates.range();
        if (r.start && r.end) {
            this.router.navigate(['/rent'], {
                queryParams: { start: r.start, end: r.end },
            });
        } else {
            this.router.navigate(['/rent']);
        }
    }
}

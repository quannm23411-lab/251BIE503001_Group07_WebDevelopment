import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ProductReviewService, ProductReview } from '../../../services/product-review.services';

interface AccountProfile {
  fullname: string;
  avatar?: string;
}

interface ChiTietDonThue {
  idXe: string;
  thoiGianNhanXe: string;
  thoiGianTraXe: string;
}

interface OrderJson {
  maDonThue: string;
  maKhachHang: string;
  thoiGianDatHang: string;
  tinhTrangDon: string;
  chiTietDonThue: ChiTietDonThue[];
}

@Component({
  selector: 'account-review-write',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './review-write.html',
  styleUrls: ['./review.css'] // dùng chung css với review
})
export class AccountReviewWrite implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private reviewService = inject(ProductReviewService);

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png'
  };

  id = '';
  vehicleId = '';
  orderInfo = {
    bike: '',
    img: '',
    start: '',
    end: ''
  };

  form!: FormGroup;
  rating = 0;
  images: string[] = [];
  submitting = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadUserFromLocalStorage();
    this.loadOrderData();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as any;
      if (data.fullname) this.user.fullname = data.fullname;
      if (data.avatar) this.user.avatar = data.avatar;
    } catch {}
  }

  private loadOrderData(): void {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem('eco_profile');
    let customerCode: string | undefined;

    if (raw) {
      try {
        const data = JSON.parse(raw) as any;
        customerCode = data.customerCode;
      } catch {
        customerCode = undefined;
      }
    }

    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (!orderId || !customerCode) return;
      this.id = orderId;

      const ordersUrl = 'assets/data/orders.json';

      this.http.get<OrderJson[]>(ordersUrl).subscribe({
        next: ordersJson => {
          const order = ordersJson.find(
            o => o.maDonThue === orderId && o.maKhachHang === customerCode
          );
          if (!order || !order.chiTietDonThue.length) return;

          const item = order.chiTietDonThue[0];
          this.vehicleId = item.idXe;

          this.orderInfo = {
            bike: this.mapVehicleName(item.idXe),
            img: this.mapVehicleImage(item.idXe),
            start: this.formatDate(item.thoiGianNhanXe),
            end: this.formatDate(item.thoiGianTraXe)
          };
        }
      });
    });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.images.push(base64);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(idx: number): void {
    this.images.splice(idx, 1);
  }

  submit(): void {
    if (this.submitting) return;

    if (this.rating <= 0) {
      alert('Vui lòng chọn số sao đánh giá.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawProfile = localStorage.getItem('eco_profile');
    if (!rawProfile) {
      alert('Bạn cần đăng nhập lại.');
      return;
    }

    let customerCode = '';
    try {
      const data = JSON.parse(rawProfile) as any;
      customerCode = data.customerCode || '';
    } catch {}

    if (!customerCode || !this.vehicleId) {
      alert('Không xác định được đơn hàng hoặc xe để đánh giá.');
      return;
    }

    const value = this.form.value;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    const newReview: ProductReview = {
      reviewId: 'U' + today.getTime(),
      vehicleId: this.vehicleId,
      customerId: customerCode,
      customerName: this.user.fullname,
      rating: this.rating,
      reviewDate: dateStr,
      status: 'pending',
      title: value.title || '',
      content: value.content || '',
      images: this.images
    };

    this.submitting = true;
    this.reviewService.addUserReview(newReview);

    // quay lại trang xem đánh giá
    this.router.navigate(['/account/review', this.id]);
  }

  cancel(): void {
    this.router.navigate(['/account/orders']);
  }

  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private mapVehicleName(idXe: string): string {
    const map: Record<string, string> = {
      V001: 'Evo 200 Lite',
      V002: 'Mẫu xe V002',
      V003: 'Mẫu xe V003',
      V005: 'Mẫu xe V005',
      V006: 'Mẫu xe V006',
      V008: 'Mẫu xe V008',
      V009: 'Mẫu xe V009',
      V011: 'Mẫu xe V011',
      V013: 'Mẫu xe V013',
      V015: 'Mẫu xe V015'
    };
    return map[idXe] || `Xe mã ${idXe}`;
  }

  private mapVehicleImage(idXe: string): string {
    const map: Record<string, string> = {
      V001: 'assets/images/products/v001.jpg',
      V002: 'assets/images/products/v002.jpg',
      V003: 'assets/images/products/v003.jpg',
      V005: 'assets/images/products/v005.jpg',
      V006: 'assets/images/products/v006.jpg',
      V008: 'assets/images/products/v008.jpg',
      V009: 'assets/images/products/v009.jpg',
      V011: 'assets/images/products/v011.jpg',
      V013: 'assets/images/products/v013.jpg',
      V015: 'assets/images/products/v015.jpg'
    };
    return map[idXe] || 'assets/images/products/placeholder.jpg';
  }
}

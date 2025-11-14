import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductReviewService } from '../../../services/product-review.services';

type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';

interface AccountProfile {
  fullname: string;
  avatar: string;
  tier?: Tier;
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

interface Product {
  id: string;
  vehicleName: string;
  image: string;
}

interface OrderInfoForReview {
  bike: string;
  img: string;
  start: string;
  end: string;
  status: string;
}

@Component({
  selector: 'account-review-write',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './review-write.html',
  styleUrls: ['./review.css'] // dùng chung css review
})
export class AccountReviewWrite implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private reviewService = inject(ProductReviewService);

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  id: string = '';

  orderInfo: OrderInfoForReview = {
    bike: '',
    img: 'assets/images/products/placeholder.jpg',
    start: '',
    end: '',
    status: ''
  };

  form: FormGroup = this.fb.group({
    rating: [5, Validators.required],
    content: ['', [Validators.required, Validators.minLength(5)]],
    image: ['']
  });

  // cho phần sao trong template
  rating: number = 5;

  // cho phần preview ảnh trong template
  images: string[] = [];

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadData();
  }

  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as any;
      if (data.fullname) this.user.fullname = data.fullname;
      if (data.avatar) this.user.avatar = data.avatar;
      if (data.tier) this.user.tier = data.tier;
    } catch {
      // ignore
    }
  }

  private getCustomerCode(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return undefined;
    try {
      const data = JSON.parse(raw) as any;
      return data.customerCode;
    } catch {
      return undefined;
    }
  }

  private loadData(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.router.navigate(['/account/orders']);
      return;
    }
    this.id = orderId;

    const customerCode = this.getCustomerCode();

    const products$ = this.http
      .get<Product[]>('assets/data/products.json')
      .pipe(catchError(() => of([] as Product[])));

    const orders$ = this.http
      .get<OrderJson[]>('assets/data/orders.json')
      .pipe(catchError(() => of([] as OrderJson[])));

    forkJoin({ products: products$, orders: orders$ }).subscribe(
      ({ products, orders }) => {
        let order = orders.find(o => o.maDonThue === orderId);
        if (customerCode) {
          const byCustomer = orders.find(
            o => o.maDonThue === orderId && o.maKhachHang === customerCode
          );
          if (byCustomer) order = byCustomer;
        }

        if (!order || !order.chiTietDonThue || !order.chiTietDonThue.length) {
          this.router.navigate(['/account/orders']);
          return;
        }

        const detail = order.chiTietDonThue[0];
        const vehicleId = detail.idXe;
        const product = products.find(p => p.id === vehicleId);

        const bikeName = product?.vehicleName || `Xe mã ${vehicleId}`;
        const img = product?.image || 'assets/images/products/placeholder.jpg';

        this.orderInfo = {
          bike: bikeName,
          img,
          start: this.formatDate(detail.thoiGianNhanXe),
          end: this.formatDate(detail.thoiGianTraXe),
          status: this.deriveStatus(order)
        };
      }
    );
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

  private mapStatus(tinhTrang: string): string {
    if (tinhTrang === 'Đã hoàn thành') return 'Hoàn thành';
    return tinhTrang;
  }

  private deriveStatus(order: OrderJson): string {
    const details = order.chiTietDonThue || [];
    if (!details.length) return this.mapStatus(order.tinhTrangDon);

    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;

    for (const d of details) {
      if (d.thoiGianNhanXe) {
        const start = new Date(d.thoiGianNhanXe);
        if (!earliestStart || start.getTime() < earliestStart.getTime()) {
          earliestStart = start;
        }
      }
      if (d.thoiGianTraXe) {
        const end = new Date(d.thoiGianTraXe);
        if (!latestEnd || end.getTime() > latestEnd.getTime()) {
          latestEnd = end;
        }
      }
    }

    if (!earliestStart || !latestEnd) {
      return this.mapStatus(order.tinhTrangDon);
    }

    const now = new Date();

    if (now.getTime() > latestEnd.getTime()) return 'Hoàn thành';
    if (now.getTime() >= earliestStart.getTime() && now.getTime() <= latestEnd.getTime()) {
      return 'Đang thuê';
    }
    if (now.getTime() < earliestStart.getTime()) return 'Sắp nhận xe';

    return this.mapStatus(order.tinhTrangDon);
  }

  // ===== các hàm cho template =====

  cancel(): void {
    this.router.navigate(['/account/orders']);
  }

  setRating(star: number): void {
    this.rating = star;
    this.form.patchValue({ rating: star });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      return;
    }

    const files = Array.from(input.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        this.images.push(url);

        // lưu tạm ảnh đầu tiên vào form cho dễ dùng
        if (!this.form.value.image) {
          this.form.patchValue({ image: url });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    if (index < 0 || index >= this.images.length) return;

    this.images.splice(index, 1);

    // cập nhật lại field image trong form
    const first = this.images[0] ?? '';
    this.form.patchValue({ image: first });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      orderId: this.id,
      vehicleName: this.orderInfo.bike,
      rating: this.rating,
      content: this.form.value.content,
      image: this.form.value.image
    };

    console.log('Review payload (demo):', payload);

    alert('Đã gửi đánh giá demo. Tính năng lưu dữ liệu sẽ được cập nhật sau.');
    this.router.navigate(['/account/orders']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductReviewService, ProductReview } from '../../../services/product-review.services';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

interface ReviewView {
  bike: string;
  img: string;
  start: string;
  end: string;
  status: string;
  text: string;
  image: string;
  time: string;
}

@Component({
  selector: 'account-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class AccountReview implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private reviewService = inject(ProductReviewService);

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  id: string = '';

  // Để tránh lỗi "Object is possibly 'null'" trong template
  review: ReviewView = {
    bike: '',
    img: 'assets/images/products/placeholder.jpg',
    start: '',
    end: '',
    status: '',
    text: '',
    image: '',
    time: ''
  };

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

    const reviews$ = this.reviewService
      .getAllReviews()
      .pipe(catchError(() => of([] as ProductReview[])));

    forkJoin({ products: products$, orders: orders$, reviews: reviews$ }).subscribe(
      ({ products, orders, reviews }) => {
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

        const reviewData = reviews.find(
          r => r.customerId === order.maKhachHang && r.vehicleId === vehicleId
        );

        const bikeName = product?.vehicleName || `Xe mã ${vehicleId}`;
        const img = product?.image || 'assets/images/products/placeholder.jpg';

        const text = reviewData?.content || 'Chưa có nội dung đánh giá.';

        // Lấy thời gian hiển thị từ thời điểm đặt đơn
        const time = order.thoiGianDatHang
          ? this.formatDateTime(order.thoiGianDatHang)
          : '';

        this.review = {
          bike: bikeName,
          img,
          start: this.formatDate(detail.thoiGianNhanXe),
          end: this.formatDate(detail.thoiGianTraXe),
          status: this.deriveStatus(order),
          text,
          image: '',   // hiện tại không dùng ảnh trong review.json để tránh lỗi type
          time
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

  private formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    const hh = ('0' + d.getHours()).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
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
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductReviewService, ProductReview } from '../../../services/product-review.services';
import { CartService, CartItem } from '../../../services/cart.services';
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

interface AccountOrderCard {
  id: string;
  name: string;
  img: string;
  start: string;
  end: string;
  status: string;
  hasReviewed: boolean;
}

interface Product {
  id: string;
  vehicleName: string;
  image: string;
  pricePerDay: number;
}

@Component({
  selector: 'account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AccountOrders implements OnInit {

  private router = inject(Router);
  private http = inject(HttpClient);
  private reviewService = inject(ProductReviewService);
  private cart = inject(CartService);

  private rawOrders: OrderJson[] = [];
  private productsMap: Record<string, Product> = {};

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  orders: AccountOrderCard[] = [];

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadAllData();
  }

  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as Partial<AccountProfile> & { tier?: Tier };
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

  private loadAllData(): void {
    const customerCode = this.getCustomerCode();
    if (!customerCode) {
      this.orders = [];
      this.rawOrders = [];
      return;
    }

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
        this.productsMap = {};
        for (const p of products) {
          if (p && p.id) {
            this.productsMap[p.id] = p;
          }
        }

        const myOrders = orders.filter(o => o.maKhachHang === customerCode);
        this.rawOrders = myOrders;

        this.orders = myOrders
          .map(order => this.mapOrderToCard(order, reviews))
          .filter(o => o !== null) as AccountOrderCard[];
      }
    );
  }

  private mapOrderToCard(
    order: OrderJson,
    reviews: ProductReview[]
  ): AccountOrderCard | null {

    if (!order.chiTietDonThue || !order.chiTietDonThue.length) {
      return null;
    }

    const item = order.chiTietDonThue[0];
    const vehicleId = item.idXe;

    const hasReviewed = reviews.some(
      r => r.customerId === order.maKhachHang && r.vehicleId === vehicleId
    );

    const product = this.productsMap[vehicleId];

    return {
      id: order.maDonThue,
      name: product?.vehicleName || `Xe mã ${vehicleId}`,
      img: product?.image || 'assets/images/products/placeholder.jpg',
      start: this.formatDate(item.thoiGianNhanXe),
      end: this.formatDate(item.thoiGianTraXe),
      status: this.deriveStatus(order),
      hasReviewed
    };
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
    if (!details.length) {
      return this.mapStatus(order.tinhTrangDon);
    }

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

    if (now.getTime() > latestEnd.getTime()) {
      return 'Hoàn thành';
    }
    if (now.getTime() >= earliestStart.getTime() && now.getTime() <= latestEnd.getTime()) {
      return 'Đang thuê';
    }
    if (now.getTime() < earliestStart.getTime()) {
      return 'Sắp nhận xe';
    }
    return this.mapStatus(order.tinhTrangDon);
  }

  private getVehiclePricePerDay(idXe: string): number {
    const product = this.productsMap[idXe];
    if (product && typeof product.pricePerDay === 'number') {
      return product.pricePerDay;
    }
    return 150000;
  }

  private calculateDays(start?: string, end?: string): number {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  rentAgain(orderCard: AccountOrderCard): void {
    const order = this.rawOrders.find(o => o.maDonThue === orderCard.id);
    if (!order || !order.chiTietDonThue || !order.chiTietDonThue.length) {
      this.router.navigate(['/rent']);
      return;
    }

    const items: CartItem[] = order.chiTietDonThue.map(detail => {
      const vehicleId = detail.idXe;
      const product = this.productsMap[vehicleId];

      const name = product?.vehicleName || `Xe mã ${vehicleId}`;
      const imageUrl = product?.image || 'assets/images/products/placeholder.jpg';

      const rentStart = detail.thoiGianNhanXe;
      const rentEnd = detail.thoiGianTraXe;
      const totalDays = this.calculateDays(rentStart, rentEnd);

      const pricePerDay = this.getVehiclePricePerDay(vehicleId);
      const finalPricePerDay = pricePerDay;
      const quantity = 1;
      const subtotal = finalPricePerDay * totalDays * quantity;

      const id = `${vehicleId}_${rentStart || 'none'}_${rentEnd || 'none'}`;

      const item: CartItem = {
        id,
        productId: vehicleId,
        name,
        imageUrl,
        rentStart,
        rentEnd,
        totalDays,
        pricePerDay,
        finalPricePerDay,
        quantity,
        subtotal,
        availabilityStatus: true
      };

      return item;
    });

    this.cart.setItems(items);

    this.router.navigate(['/checkout'], {
      state: { selectedIds: items.map(i => i.id) }
    });
  }
}

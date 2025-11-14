import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductReviewService, ProductReview } from '../../../services/product-review.services';
import { CartService, CartItem } from '../../../services/cart.services';

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

  // Lưu list đơn gốc để dùng khi Thuê lại
  private rawOrders: OrderJson[] = [];

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  orders: AccountOrderCard[] = [];

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadOrdersFromJson();
  }

  // ====== LOAD USER ======
  private loadUserFromLocalStorage(): void {
    // an toàn cho mọi môi trường
    if (typeof localStorage === 'undefined') {
      return;
    }

    const raw = localStorage.getItem('eco_profile');
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw) as Partial<AccountProfile> & { tier?: Tier };

      if (data.fullname) {
        this.user.fullname = data.fullname;
      }
      if (data.avatar) {
        this.user.avatar = data.avatar;
      }
      if (data.tier) {
        this.user.tier = data.tier;
      }
    } catch {
      // bỏ qua lỗi parse
    }
  }

  // ====== LOAD ORDERS ======
  private loadOrdersFromJson(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

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

    if (!customerCode) {
      this.orders = [];
      this.rawOrders = [];
      return;
    }

    const ordersUrl = 'assets/data/orders.json';

    this.http.get<OrderJson[]>(ordersUrl).subscribe({
      next: ordersJson => {
        const myOrders = ordersJson.filter(o => o.maKhachHang === customerCode);
        this.rawOrders = myOrders;

        this.reviewService.getAllReviews().subscribe({
          next: (reviews: ProductReview[]) => {
            this.orders = myOrders
              .map(order => this.mapOrderToCard(order, reviews))
              .filter(o => o !== null) as AccountOrderCard[];
          },
          error: () => {
            this.orders = myOrders
              .map(order => this.mapOrderToCard(order, []))
              .filter(o => o !== null) as AccountOrderCard[];
          }
        });
      },
      error: () => {
        this.orders = [];
        this.rawOrders = [];
      }
    });
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

    return {
      id: order.maDonThue,
      name: this.mapVehicleName(vehicleId),
      img: this.mapVehicleImage(vehicleId),
      start: this.formatDate(item.thoiGianNhanXe),
      end: this.formatDate(item.thoiGianTraXe),
      status: this.deriveStatus(order),
      hasReviewed
    };
  }

  // ====== FORMAT / MAP ======
  private formatDate(iso: string | null | undefined): string {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return '';
    }
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private mapStatus(tinhTrang: string): string {
    if (tinhTrang === 'Đã hoàn thành') {
      return 'Hoàn thành';
    }
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

    if (now.getTime() >= earliestStart.getTime() &&
        now.getTime() <= latestEnd.getTime()) {
      return 'Đang thuê';
    }

    if (now.getTime() < earliestStart.getTime()) {
      return 'Sắp nhận xe';
    }

    return this.mapStatus(order.tinhTrangDon);
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

  // Giá demo mỗi xe để Thuê lại
  private mapVehiclePrice(idXe: string): number {
    const map: Record<string, number> = {
      V001: 150000,
      V002: 160000,
      V003: 170000,
      V005: 180000,
      V006: 190000,
      V008: 200000,
      V009: 210000,
      V011: 220000,
      V013: 230000,
      V015: 240000
    };
    return map[idXe] ?? 150000;
  }

  // Tính số ngày từ string ngày nhận và trả
  private calculateDays(start?: string, end?: string): number {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  // ====== THUÊ LẠI ======
  rentAgain(orderCard: AccountOrderCard): void {
    const order = this.rawOrders.find(o => o.maDonThue === orderCard.id);

    if (!order || !order.chiTietDonThue || !order.chiTietDonThue.length) {
      this.router.navigate(['/rent']);
      return;
    }

    const items: CartItem[] = order.chiTietDonThue.map(detail => {
      const vehicleId = detail.idXe;
      const name = this.mapVehicleName(vehicleId);
      const imageUrl = this.mapVehicleImage(vehicleId);

      const rentStart = detail.thoiGianNhanXe;
      const rentEnd = detail.thoiGianTraXe;
      const totalDays = this.calculateDays(rentStart, rentEnd);

      const pricePerDay = this.mapVehiclePrice(vehicleId);
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
      state: {
        selectedIds: items.map(i => i.id)
      }
    });
  }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';

// ==========================================================
// ⭐ SỬA LỖI 1: Đường dẫn import
// ==========================================================
import { catchError } from 'rxjs'; // <-- Sửa từ 'rxjs.operators' thành 'rxjs'

// --- ĐỊNH NGHĨA CÁC INTERFACE CẦN THIẾT ---
// (Giữ nguyên các interface của bạn)
interface ProcessedOrderItem {
  idXe: string;
  vehicleName: string;
  image: string;
  soLuong: number;
  donGia: number;
  thoiGianNhanXe: string;
  thoiGianTraXe: string;
}
interface ProcessedOrderCard {
  maDonThue: string;
  thoiGianDatHang: string;
  tinhTrangDon: string;
  tinhTrangDonClass: string;
  tongChiPhi: number;
  items: ProcessedOrderItem[]; 
  canReview: boolean;
  canViewReview: boolean;
}
interface ProductReview { reviewId: string; vehicleId: string; customerId: string; orderId: string; }
type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';
interface AccountProfile { fullname: string; avatar: string; tier?: Tier; }
interface ChiTietDonThue {
  idXe: string;
  soLuong: number;
  donGia: number;
  soNgayThue: number;
  tongGiaTri: number;
  thoiGianNhanXe: string;
  thoiGianTraXe: string;
  [key: string]: any;
}
interface OrderJson {
  maDonThue: string;
  maKhachHang: string;
  thoiGianDatHang: string;
  tinhTrangDon: string;
  chiTietDonThue: ChiTietDonThue[];
  thanhToan: {
    chiPhiSauGiam: number;
    [key: string]: any;
  };
  [key: string]: any;
}
interface Product { id: string; vehicleName: string; image: string; pricePerDay: number; }


@Component({
  selector: 'account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AccountOrders implements OnInit {

  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private productsMap = new Map<string, Product>();

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  public searchTerm: string = '';
  public allMyOrders: ProcessedOrderCard[] = []; 
  public filteredOrders: ProcessedOrderCard[] = []; 

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadAllData();
  }

  // ... (loadUserFromLocalStorage và getCustomerCode giữ nguyên) ...
  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as Partial<AccountProfile> & { tier?: Tier, customerCode?: string };
      if (data.fullname) this.user.fullname = data.fullname;
      if (data.avatar) this.user.avatar = data.avatar;
      if (data.tier) this.user.tier = data.tier;
    } catch { /* ignore */ }
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
      this.allMyOrders = [];
      this.filteredOrders = [];
      return;
    }

    // ==========================================================
    // ⭐ SỬA LỖI 2: Thêm kiểu (Type) cho http.get
    // ==========================================================
    const products$ = this.http.get<Product[]>('assets/data/products.json').pipe(catchError(() => of([] as Product[])));
    const orders$ = this.http.get<OrderJson[]>('assets/data/orders.json').pipe(catchError(() => of([] as OrderJson[])));
    const reviews$ = this.http.get<ProductReview[]>('assets/data/product-reviews.json').pipe(catchError(() => of([] as ProductReview[])));
    // ==========================================================


    forkJoin({ products: products$, orders: orders$, reviews: reviews$ }).subscribe(
      // Bây giờ 'products', 'orders', 'reviews' đã có kiểu, không còn là 'unknown'
      ({ products, orders, reviews }) => { 
        
        // Các lỗi 'any' và 'unknown' ở dưới sẽ tự biến mất
        this.productsMap = new Map(products.map(p => [p.id, p]));
        const myOrders = orders.filter(o => o.maKhachHang === customerCode);
        
        const reviewedOrderIds = new Set(
          reviews
            .filter(r => r.customerId === customerCode)
            .map(r => r.orderId)
        );

        this.allMyOrders = myOrders.map(order => 
          this.mapOrderToCard(order, reviewedOrderIds)
        );
        
        this.applyFilter();
        this.cdr.detectChanges();
      }
    );
  }

  // ... (applyFilter giữ nguyên) ...
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredOrders = [...this.allMyOrders];
      return;
    }

    this.filteredOrders = this.allMyOrders.filter(order => {
      const matchesOrderId = order.maDonThue.toLowerCase().includes(term);
      const matchesVehicleName = order.items.some(item => 
        item.vehicleName.toLowerCase().includes(term)
      );
      return matchesOrderId || matchesVehicleName;
    });
  }

  // ... (mapOrderToCard giữ nguyên) ...
  private mapOrderToCard(order: OrderJson, reviewedOrderIds: Set<string>): ProcessedOrderCard {
    
    const items: ProcessedOrderItem[] = order.chiTietDonThue.map(detail => {
      const product = this.productsMap.get(detail.idXe);
      return {
        idXe: detail.idXe,
        vehicleName: product?.vehicleName || 'Xe không rõ tên',
        image: product?.image || 'assets/images/products/placeholder.jpg',
        soLuong: detail.soLuong,
        donGia: detail.donGia,
        thoiGianNhanXe: detail.thoiGianNhanXe,
        thoiGianTraXe: detail.thoiGianTraXe
      };
    });

    const isCompleted = order.tinhTrangDon === 'Đã hoàn thành';
    const isReviewed = reviewedOrderIds.has(order.maDonThue);

    const canReview = isCompleted && !isReviewed;
    const canViewReview = isCompleted && isReviewed;

    return {
      maDonThue: order.maDonThue,
      thoiGianDatHang: order.thoiGianDatHang,
      tinhTrangDon: this.mapStatus(order.tinhTrangDon),
      tinhTrangDonClass: this.getStatusClass(order.tinhTrangDon),
      tongChiPhi: order.thanhToan.chiPhiSauGiam,
      items: items,
      canReview: canReview,
      canViewReview: canViewReview
    };
  }

  // --- CÁC HÀM HELPER (Giữ nguyên) ---

  private getStatusClass(status: string): string {
    switch (status) {
      case 'Đã hoàn thành': return 'completed';
      case 'Đang thuê': return 'rented';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã huỷ': return 'cancelled';
      case 'Chờ giao': return 'confirmed';
      case 'Đã trả': return 'completed';
      case 'Sự cố': return 'cancelled';
      default: return '';
    }
  }

  private mapStatus(tinhTrang: string): string {
    if (tinhTrang === 'Đã hoàn thành') return 'Hoàn thành';
    if (tinhTrang === 'Đã huỷ') return 'Đã huỷ';
    if (tinhTrang === 'Đã xác nhận') return 'Đã xác nhận';
    if (tinhTrang === 'Đang thuê') return 'Đang thuê';
    return tinhTrang;
  }
  
  goToDetail(orderId: string): void {
    this.router.navigate(['/account/order-detail', orderId]);
  }

  goToReview(orderId: string): void {
    this.router.navigate(['/account/review', orderId, 'write']);
  }

  goToViewReview(orderId: string): void {
    this.router.navigate(['/account/review', orderId, 'write']);
  }
}
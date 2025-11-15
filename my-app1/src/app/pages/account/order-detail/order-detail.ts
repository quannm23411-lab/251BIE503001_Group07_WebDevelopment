import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs';

// --- ĐỊNH NGHĨA INTERFACE ---

interface Product {
  id: string;
  vehicleName: string;
  image: string;
}
interface Customer {
  maKhachHang: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  thongTinBangLai: {
    soBangLai: string;
  };
}
interface ChiTietDonThue {
  idXe: string;
  soLuong: number;
  donGia: number;
  soNgayThue: number;
  tongGiaTri: number;
  thoiGianNhanXe: string;
  thoiGianTraXe: string;
  diaDiemNhanXe: string;
  diaDiemTraXe: string;
}
interface OrderJson {
  maDonThue: string;
  maKhachHang: string;
  thoiGianDatHang: string;
  tinhTrangDon: string;
  chiTietDonThue: ChiTietDonThue[];
  thanhToan: {
    tongGiaTriGoc: number;
    maGiamGia: string | null;
    tienGiam: number;
    chiPhiSauGiam: number;
    tinhTrangThanhToan: string;
  };
}
interface ProcessedItem extends ChiTietDonThue {
  vehicleName: string;
  image: string;
}

// ===============================================
// ⭐ LỖI ĐƯỢC SỬA Ở ĐÂY: Đổi tên interface
// ===============================================
interface IOrderDetail extends OrderJson {
  customer: Customer | null;
  processedItems: ProcessedItem[];
}
// ===============================================

type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';
interface AccountProfile {
  fullname: string;
  avatar: string;
  tier?: Tier;
}

// --- Bắt đầu phần Component ---

@Component({
  selector: 'app-order-detail',
  standalone: true, 
  imports: [
    CommonModule, 
    RouterLink    
  ], 
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css' 
})
export class OrderDetail implements OnInit { 

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Bây giờ các thuộc tính này sẽ được nhận diện
  public user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };
  
  public isLoading = signal(true);
  
  // ===============================================
  // ⭐ VÀ SỬ DỤNG TÊN MỚI Ở ĐÂY
  // ===============================================
  public order: WritableSignal<IOrderDetail | null> = signal(null);
  // ===============================================
  
  private productsMap = new Map<string, Product>();

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadOrderDetail();
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
    } catch { /* ignore */ }
  }

  private loadOrderDetail(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const orderId = params.get('id');
        if (!orderId) {
          return of(null);
        }
        this.isLoading.set(true);
        
        const products$ = this.http.get<Product[]>('assets/data/products.json').pipe(catchError(() => of([] as Product[])));
        const orders$ = this.http.get<OrderJson[]>('assets/data/orders.json').pipe(catchError(() => of([] as OrderJson[])));
        const customers$ = this.http.get<Customer[]>('assets/data/customers.json').pipe(catchError(() => of([] as Customer[])));

        return forkJoin({ 
          products: products$, 
          orders: orders$, 
          customers: customers$,
          orderId: of(orderId)
        });
      })
    ).subscribe(result => {
      if (!result) {
        this.isLoading.set(false);
        this.order.set(null);
        return;
      }

      const { products, orders, customers, orderId } = result;
      this.productsMap = new Map(products.map(p => [p.id, p]));
      const rawOrder = orders.find(o => o.maDonThue === orderId);

      if (!rawOrder) {
        this.isLoading.set(false);
        this.order.set(null);
        return;
      }

      const customer = customers.find(c => c.maKhachHang === rawOrder.maKhachHang) || null;
      const processedItems: ProcessedItem[] = rawOrder.chiTietDonThue.map(detail => {
        const product = this.productsMap.get(detail.idXe);
        return {
          ...detail,
          vehicleName: product?.vehicleName || 'Xe không rõ tên',
          image: product?.image || 'assets/images/products/placeholder.jpg'
        };
      });

      this.order.set({
        ...rawOrder,
        customer: customer,
        processedItems: processedItems
      });
      this.isLoading.set(false);
    });
  }

  // Bây giờ các phương thức này sẽ được nhận diện
  public getStatusClass(status: string): string {
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

  public mapStatus(tinhTrang: string): string {
    if (tinhTrang === 'Đã hoàn thành') return 'Hoàn thành';
    if (tinhTrang === 'Đã huỷ') return 'Đã huỷ';
    if (tinhTrang === 'Đã xác nhận') return 'Đã xác nhận';
    if (tinhTrang === 'Đang thuê') return 'Đang thuê';
    return tinhTrang;
  }

  public backToOrders(): void {
    this.router.navigate(['/account/orders']);
  }
}
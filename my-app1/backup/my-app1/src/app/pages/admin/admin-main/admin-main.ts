import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-main.html',
  styleUrl: './admin-main.css'
})
export class AdminMain implements OnInit {
  isLoading: boolean = true;
  
  // 1. Thẻ thống kê
  stats = {
    totalRevenue: 0,
    totalOrders: 0,
    activeRentals: 0,
    uniqueCustomers: 0
  };

  // 2. Bảng đơn hàng gần đây
  recentOrders: any[] = [];
  
  // 3. Danh sách xe
  topVehicles: any[] = [];

  // Map để tra cứu
  private productsMap = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    
    // Tải đồng thời 2 file data chính
    const orders$ = this.http.get<any[]>('assets/data/orders.json');
    const products$ = this.http.get<any[]>('assets/data/products.json');

    forkJoin([orders$, products$]).subscribe({
      next: ([ordersData, productsData]) => {
        // Tạo map tra cứu tên/ảnh xe
        this.productsMap = new Map(productsData.map(p => [p.id, p]));
        
        // Bắt đầu xử lý
        this.processStats(ordersData);
        this.processRecentOrders(ordersData);
        this.processTopVehicles(ordersData);
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu Dashboard', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Tính toán 4 thẻ thống kê
   */
  processStats(orders: any[]) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.thanhToan.chiPhiSauGiam, 0);
    const totalOrders = orders.length;
    const activeRentals = orders.filter(o => o.tinhTrangDon === 'Đang thuê').length;
    const uniqueCustomers = new Set(orders.map(o => o.maKhachHang)).size;

    this.stats = { totalRevenue, totalOrders, activeRentals, uniqueCustomers };
  }

  /**
   * Lấy 5 đơn hàng mới nhất
   */
  processRecentOrders(orders: any[]) {
    this.recentOrders = [...orders] // Copy mảng
      .sort((a, b) => new Date(b.thoiGianDatHang).getTime() - new Date(a.thoiGianDatHang).getTime()) // Sắp xếp mới nhất
      .slice(0, 5) // Lấy 5
      .map(order => ({
        ...order,
        // Thêm class để CSS
        tinhTrangDonClass: this.getStatusClass(order.tinhTrangDon),
        paymentStatusClass: this.getPaymentStatusClass(order.thanhToan.tinhTrangThanhToan)
      }));
  }

  /**
   * Tính 5 xe được thuê nhiều nhất
   */
  processTopVehicles(orders: any[]) {
    const vehicleCounts = new Map<string, number>();

    // Đếm số lượng từ tất cả các đơn
    orders.forEach(order => {
      order.chiTietDonThue.forEach((item: any) => {
        const currentCount = vehicleCounts.get(item.idXe) || 0;
        // Cộng dồn theo số lượng (hoặc có thể cộng theo soNgayThue)
        vehicleCounts.set(item.idXe, currentCount + item.soLuong); 
      });
    });

    // Chuyển Map thành mảng [[id, count], ...]
    const sortedVehicles = [...vehicleCounts.entries()]
      .sort((a, b) => b[1] - a[1]) // Sắp xếp theo count
      .slice(0, 5); // Lấy 5

    // Map với thông tin từ products.json
    this.topVehicles = sortedVehicles.map(([id, count]) => {
      return {
        product: this.productsMap.get(id) || { vehicleName: 'Xe không rõ', image: '' },
        count: count
      };
    });
  }

  // --- Các hàm Helper (Copy từ admin-order.ts) ---
  getStatusClass(status: string): string {
    switch (status) {
      case 'Đã hoàn thành': return 'completed';
      case 'Đang thuê': return 'rented';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã hủy': return 'cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): any {
    switch (status) {
      case 'Đã thanh toán': return 'paid';
      case 'Chờ thanh toán': return 'pending';
      default: 'pending';
    }
  }

  // --- Các hàm điều hướng ---
  goToOrder(orderId: string) {
    this.router.navigate(['/admin/order-detail', orderId]);
  }

  goToBike(bikeId: string) {
    this.router.navigate(['/admin/bike-detail', bikeId]);
  }

  goToAllOrders() {
    this.router.navigate(['/admin/order']);
  }
}
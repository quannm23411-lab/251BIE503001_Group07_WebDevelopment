import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

/**
 * Interface đã được xử lý (kết hợp) để hiển thị trên Bảng
 */
interface ProcessedRental {
  maDonThue: string;
  khachHangTen: string;
  khachHangSdt: string;
  thoiGianDatHang: string; // ISO date string
  tongChiPhi: number;
  tinhTrangDon: string;
  tinhTrangDonClass: string; // CSS class
  paymentStatus: string;
  paymentStatusClass: string;
  khuVuc: string; 
  rawRentalData: any; // Lưu dữ liệu gốc
}

@Component({
  selector: 'app-admin-order',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-order.html',
  styleUrl: './admin-order.css'
})
export class AdminOrder implements OnInit {
  rentals: ProcessedRental[] = [];
  filteredRentals: ProcessedRental[] = [];
  isLoading: boolean = true;

  // Thuộc tính cho bộ lọc
  searchTerm = '';
  statusFilter = '';
  locationFilter = ''; 
  startDateFilter = '';
  endDateFilter = '';   
  
  statuses = ['Đã hoàn thành', 'Đang thuê', 'Đã xác nhận', 'Đã hủy'];
  locations = ['TP. Hồ Chí Minh', 'TP. Hà Nội', 'TP. Đà Nẵng', 'Khác'];

  // 🔽 THÊM MỚI: Biến theo dõi trạng thái sắp xếp
  sortColumn: keyof ProcessedRental | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    const rentals$ = this.http.get<any[]>('assets/data/orders.json');
    const customers$ = this.http.get<any[]>('assets/data/customers.json');

    forkJoin([rentals$, customers$]).subscribe({
      next: ([rentalsData, customersData]) => {
        const customerMap = new Map(customersData.map(c => [c.maKhachHang, c]));
        const mapped = this.mapData(rentalsData, customerMap);
        
        this.rentals = mapped;
        this.applyFilter();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Không tải được dữ liệu đơn thuê', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // ... (Giữ nguyên các hàm: getKhuVuc, mapData, getStatusClass, getPaymentStatusClass) ...
  getKhuVuc(diaDiem: string): string {
    const diaDiemLower = diaDiem.toLowerCase();
    if (diaDiemLower.includes('hà nội') || diaDiemLower.includes('hanoi')) {
      return 'TP. Hà Nội';
    }
    if (diaDiemLower.includes('hcm') || diaDiemLower.includes('hồ chí minh')) {
      return 'TP. Hồ Chí Minh';
    }
    if (diaDiemLower.includes('đà nẵng') || diaDiemLower.includes('danang')) {
      return 'TP. Đà Nẵng';
    }
    return 'Khác';
  }

  mapData(rentals: any[], customerMap: Map<string, any>): ProcessedRental[] {
    return rentals.map(rental => {
      const customer = customerMap.get(rental.maKhachHang) || {};
      const status = rental.tinhTrangDon;
      const paymentStatus = rental.thanhToan.tinhTrangThanhToan || 'Chờ thanh toán';
      const diaDiem = rental.chiTietDonThue[0]?.diaDiemNhanXe || 'N/A';

      return {
        maDonThue: rental.maDonThue,
        khachHangTen: customer.hoTen || 'Khách vãng lai',
        khachHangSdt: customer.soDienThoai || 'N/A',
        thoiGianDatHang: rental.thoiGianDatHang,
        tongChiPhi: rental.thanhToan.chiPhiSauGiam,
        tinhTrangDon: status,
        tinhTrangDonClass: this.getStatusClass(status),
        paymentStatus: paymentStatus,
        paymentStatusClass: this.getPaymentStatusClass(paymentStatus),
        khuVuc: this.getKhuVuc(diaDiem),
        rawRentalData: rental
      };
    });
  }

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


  /**
   * Hàm lọc (Cập nhật)
   */
  applyFilter() {
    this.filteredRentals = this.rentals.filter(r => {
      // ... (Phần code lọc giữ nguyên) ...
      const search = this.searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        r.maDonThue.toLowerCase().includes(search) ||
        r.khachHangTen.toLowerCase().includes(search) ||
        r.khachHangSdt.includes(search);
      const matchesStatus = !this.statusFilter || r.tinhTrangDon === this.statusFilter;
      const matchesLocation = !this.locationFilter || r.khuVuc === this.locationFilter;
      let matchesDate = true;
      const orderDate = new Date(r.thoiGianDatHang);
      if (this.startDateFilter) {
        matchesDate = matchesDate && orderDate >= new Date(this.startDateFilter);
      }
      if (this.endDateFilter) {
        const endDate = new Date(this.endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= endDate;
      }
      // ... (Hết phần code lọc) ...

      return matchesSearch && matchesStatus && matchesLocation && matchesDate;
    });

    // 🔽 THÊM MỚI: Sắp xếp sau khi lọc
    this.applySort();
  }

  /**
   * Reset lọc (Cập nhật)
   */
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.locationFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    
    // 🔽 THÊM MỚI: Reset cả sắp xếp
    this.sortColumn = '';
    
    this.applyFilter();
  }

  goToDetail(rental: ProcessedRental) {
    this.router.navigate(['/admin/order-detail', rental.maDonThue]);
  }
  goToAddPage() {
    this.router.navigate(['/admin/order-add']);
  }
  // 🔽 THÊM MỚI: Hàm được gọi khi click vào tiêu đề
  onSort(columnKey: keyof ProcessedRental) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  // 🔽 THÊM MỚI: Hàm thực hiện sắp xếp
  applySort() {
    if (this.sortColumn) {
      this.filteredRentals.sort((a, b) => {
        const valA = a[this.sortColumn as keyof ProcessedRental];
        const valB = b[this.sortColumn as keyof ProcessedRental];
        
        let comparison = 0;

        // Xử lý riêng cho 'tongChiPhi' (vì là number)
        if (this.sortColumn === 'tongChiPhi' && typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } 
        // Xử lý cho tất cả các chuỗi khác (dùng Tiếng Việt)
        // (Bao gồm cả ISO date string, so sánh chuỗi cũng đúng)
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        }
        
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }
}